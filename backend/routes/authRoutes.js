const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updatePasswordValidation,
} = require('../utils/validators/authValidators');

// Strict limiter for brute-force-prone endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signupValidation, validateRequest, signup);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidation,
  validateRequest,
  forgotPassword
);
router.put(
  '/reset-password/:resetToken',
  resetPasswordValidation,
  validateRequest,
  resetPassword
);
router.put('/update-password', protect, updatePasswordValidation, validateRequest, updatePassword);

module.exports = router;
