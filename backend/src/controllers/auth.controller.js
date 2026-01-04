import * as authService from '../services/auth.service.js';
import * as otpService from '../services/otp.service.js';
import User from '../models/User.model.js';

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { phone, purpose = 'register' } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại là bắt buộc'
      });
    }

    // Check if user exists based on purpose
    const userExists = await User.findOne({ phone });

    if (purpose === 'register' && userExists) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại đã được đăng ký'
      });
    }

    if (purpose === 'reset-password' && !userExists) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tồn tại'
      });
    }

    // Send OTP
    const result = await otpService.createOTP(phone, purpose);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp, purpose = 'register' } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại và OTP là bắt buộc'
      });
    }

    // Verify OTP
    const result = await otpService.verifyOTP(phone, otp, purpose);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { phone, name, password, role, otp } = req.body;

    // Validate required fields
    if (!phone || !name || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Verify OTP first
    const otpResult = await otpService.verifyOTP(phone, otp, 'register');
    
    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    // Register user
    const result = await authService.registerUser({
      phone,
      name,
      password,
      role: role || 'user'
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại và mật khẩu là bắt buộc'
      });
    }

    // Login user
    const result = await authService.loginUser(phone, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Verify OTP first
    const otpResult = await otpService.verifyOTP(phone, otp, 'reset-password');
    
    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    // Reset password
    const result = await authService.resetPassword(phone, newPassword);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export default {
  sendOTP,
  verifyOTP,
  register,
  login,
  resetPassword,
  getCurrentUser
};

