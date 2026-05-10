const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { sendEmail } = require('../config/email');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

// ── Send OTP ─────────────────────────────────────────────────
const sendOtp = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    // Check email not already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous OTPs for this email
    await query('DELETE FROM otp_verifications WHERE email = $1', [email]);

    // Store hashed OTP
    await query(
      'INSERT INTO otp_verifications (email, otp_hash, expires_at) VALUES ($1, $2, $3)',
      [email, otpHash, expiresAt]
    );

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Your FinTrack Verification Code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">FinTrack</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0">Verify your email address</p>
          </div>
          <div style="background:#ffffff;padding:30px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
            <p style="color:#334155;font-size:15px">Hi <strong>${name || 'there'}</strong>,</p>
            <p style="color:#475569;font-size:14px">Enter the code below to verify your email and complete registration. This code expires in <strong>10 minutes</strong>.</p>
            <div style="text-align:center;margin:28px 0">
              <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#6366f1;background:#f1f5f9;padding:16px 24px;border-radius:10px;display:inline-block">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    next(err);
  }
};

// ── Register (after OTP verified on frontend) ────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    // Verify OTP
    const otpResult = await query(
      'SELECT otp_hash FROM otp_verifications WHERE email = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    if (otpResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }
    const isOtpValid = await bcrypt.compare(String(otp), otpResult.rows[0].otp_hash);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const userResult = await query(
      `INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, phone]
    );
    const user = userResult.rows[0];

    // Create financial profile
    await query('INSERT INTO financial_profiles (user_id) VALUES ($1)', [user.id]);

    // Clean up OTP
    await query('DELETE FROM otp_verifications WHERE email = $1', [email]);

    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, refreshExpiry]
    );

    sendEmail({
      to: email,
      subject: 'Welcome to FinTrack! 🎉',
      html: `<h2>Welcome, ${name}! 🎉</h2><p>Your account has been verified and created successfully. Start building strong financial habits today!</p>`,
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, name, email, role, password_hash, is_active FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, refreshExpiry]
    );

    const { password_hash: _, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
      [token, decoded.id]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Rotate token
    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [decoded.id, newRefreshToken, refreshExpiry]
    );

    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendOtp, register, login, refreshToken, logout };
