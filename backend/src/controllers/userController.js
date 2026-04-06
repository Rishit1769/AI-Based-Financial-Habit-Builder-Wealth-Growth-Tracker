const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.created_at,
              fp.currency, fp.monthly_income_target, fp.bio
       FROM users u
       LEFT JOIN financial_profiles fp ON fp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar_url, currency, monthly_income_target, bio } = req.body;

    await query(
      `UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3`,
      [name, avatar_url, req.user.id]
    );

    await query(
      `INSERT INTO financial_profiles (user_id, currency, monthly_income_target, bio)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET currency = COALESCE($2, financial_profiles.currency),
           monthly_income_target = COALESCE($3, financial_profiles.monthly_income_target),
           bio = COALESCE($4, financial_profiles.bio)`,
      [req.user.id, currency, monthly_income_target, bio]
    );

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.created_at,
              fp.currency, fp.monthly_income_target, fp.bio
       FROM users u LEFT JOIN financial_profiles fp ON fp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json({ success: true, message: 'Profile updated', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(newPassword, salt);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    // Revoke all refresh tokens
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
