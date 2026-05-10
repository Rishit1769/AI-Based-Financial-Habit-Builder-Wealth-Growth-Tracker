const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const incomeRoutes = require('./src/routes/incomeRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const habitRoutes = require('./src/routes/habitRoutes');
const savingsRoutes = require('./src/routes/savingsRoutes');
const investmentRoutes = require('./src/routes/investmentRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const downloadRoutes = require('./src/routes/downloadRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');
const schedulerService = require('./src/services/schedulerService');

const app = express();

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    exposedHeaders: ['X-Report-Email-Status'],
  })
);

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start cron scheduler
schedulerService.start();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
