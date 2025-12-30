import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth.middleware';
import {
  requestOTP,
  register,
  login,
  getProfile,
  refreshToken,
  resetPassword
} from '../controllers/auth.controller';

const router = express.Router();

// Validation rules
const phoneNumberValidation = body('phoneNumber')
  .trim()
  .notEmpty()
  .withMessage('Số điện thoại là bắt buộc')
  .isLength({ min: 10, max: 15 })
  .withMessage('Số điện thoại phải có độ dài từ 10-15 ký tự');

const otpCodeValidation = body('otpCode')
  .trim()
  .notEmpty()
  .withMessage('Mã OTP là bắt buộc')
  .isLength({ min: 6, max: 6 })
  .withMessage('Mã OTP phải có 6 chữ số')
  .isNumeric()
  .withMessage('Mã OTP chỉ chứa số');

const passwordValidation = body('password')
  .optional()
  .isLength({ min: 6 })
  .withMessage('Mật khẩu phải có ít nhất 6 ký tự');

const fullNameValidation = body('fullName')
  .optional()
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Họ tên phải có độ dài từ 2-100 ký tự');

/**
 * @route   POST /api/v1/auth/otp/request
 * @desc    Request OTP for registration or login
 * @access  Public
 */
router.post(
  '/otp/request',
  otpLimiter,
  [
    phoneNumberValidation,
    body('purpose')
      .isIn(['register', 'login'])
      .withMessage('Mục đích phải là register hoặc login')
  ],
  validateRequest,
  requestOTP
);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user with OTP verification
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  [
    phoneNumberValidation,
    otpCodeValidation,
    passwordValidation,
    fullNameValidation
  ],
  validateRequest,
  register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with phone number and OTP or password
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  [
    phoneNumberValidation,
    body('otpCode')
      .optional()
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('Mã OTP phải có 6 chữ số')
      .isNumeric()
      .withMessage('Mã OTP chỉ chứa số'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body().custom((value) => {
      if (!value.otpCode && !value.password) {
        throw new Error('Phải cung cấp mã OTP hoặc mật khẩu');
      }
      return true;
    })
  ],
  validateRequest,
  login
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token là bắt buộc')
  ],
  validateRequest,
  refreshToken
);

/**
 * @route   POST /api/v1/auth/password/reset
 * @desc    Reset password with OTP verification
 * @access  Public
 */
router.post(
  '/password/reset',
  authLimiter,
  [
    phoneNumberValidation,
    body('otpCode')
      .trim()
      .notEmpty()
      .withMessage('Mã OTP là bắt buộc')
      .isLength({ min: 6, max: 6 })
      .withMessage('Mã OTP phải có 6 chữ số')
      .isNumeric()
      .withMessage('Mã OTP chỉ chứa số'),
    body('newPassword')
      .notEmpty()
      .withMessage('Mật khẩu mới là bắt buộc')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
  ],
  validateRequest,
  resetPassword
);

export default router;

