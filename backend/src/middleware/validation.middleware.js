import { body, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({
      success: false,
      message: errorMessages,
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Validation rules for registration
 */
export const registerValidation = [
  body('phone')
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('name')
    .notEmpty().withMessage('Tên là bắt buộc')
    .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2-100 ký tự'),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  body('role')
    .optional()
    .isIn(['user', 'driver']).withMessage('Role phải là user hoặc driver'),
  
  body('otp')
    .notEmpty().withMessage('OTP là bắt buộc')
    .isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số'),
  
  validate
];

/**
 * Validation rules for login
 */
export const loginValidation = [
  body('phone')
    .notEmpty().withMessage('Số điện thoại là bắt buộc'),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
  
  validate
];

/**
 * Validation rules for sending OTP
 */
export const sendOTPValidation = [
  body('phone')
    .notEmpty().withMessage('Số điện thoại là bắt buộc')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('purpose')
    .optional()
    .isIn(['register', 'reset-password', 'verify-phone'])
    .withMessage('Purpose không hợp lệ'),
  
  validate
];

/**
 * Validation rules for reset password
 */
export const resetPasswordValidation = [
  body('phone')
    .notEmpty().withMessage('Số điện thoại là bắt buộc'),
  
  body('otp')
    .notEmpty().withMessage('OTP là bắt buộc')
    .isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số'),
  
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  validate
];

export default {
  validate,
  registerValidation,
  loginValidation,
  sendOTPValidation,
  resetPasswordValidation
};

