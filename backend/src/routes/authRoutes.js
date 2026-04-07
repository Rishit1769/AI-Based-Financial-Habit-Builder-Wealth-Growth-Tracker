const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { sendOtp, register, login, refreshToken, logout } = require('../controllers/authController');

router.post(
  '/send-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  ],
  validate,
  sendOtp
);

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('otp').notEmpty().withMessage('OTP is required'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
