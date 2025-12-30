import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { validateVietnamesePhone } from '../utils/phoneValidator';
import { createAndSendOTP, verifyOTP } from '../services/otp.service';
import { generateTokenPair, verifyRefreshToken, generateAccessToken } from '../utils/jwt.utils';
import { createError } from '../middleware/errorHandler';

/**
 * Request OTP for registration or login
 */
export const requestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, purpose } = req.body;

    if (!phoneNumber) {
      throw createError('Số điện thoại là bắt buộc', 400);
    }

    if (!purpose || !['register', 'login', 'reset_password'].includes(purpose)) {
      throw createError('Mục đích không hợp lệ', 400);
    }

    // Validate and format phone number
    const formattedPhone = validateVietnamesePhone(phoneNumber);
    if (!formattedPhone) {
      throw createError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam', 400);
    }

    // Check if user exists for login purpose
    if (purpose === 'login') {
      const user = await User.findOne({ phoneNumber: formattedPhone });
      if (!user) {
        throw createError('Số điện thoại chưa được đăng ký', 404);
      }
    }

    // Check if user exists for reset_password purpose
    if (purpose === 'reset_password') {
      const user = await User.findOne({ phoneNumber: formattedPhone });
      if (!user) {
        throw createError('Số điện thoại chưa được đăng ký', 404);
      }
    }

    // Check if user already exists for register purpose
    if (purpose === 'register') {
      const existingUser = await User.findOne({ phoneNumber: formattedPhone });
      if (existingUser) {
        throw createError('Số điện thoại đã được đăng ký', 409);
      }
    }

    // Create and send OTP
    const result = await createAndSendOTP(formattedPhone, purpose);

    if (!result.success) {
      throw createError(result.message, 400);
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        phoneNumber: formattedPhone,
        expiresIn: 5 * 60 // 5 minutes in seconds
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Register new user with OTP verification
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, otpCode, password, fullName } = req.body;

    if (!phoneNumber || !otpCode) {
      throw createError('Số điện thoại và mã OTP là bắt buộc', 400);
    }

    // Validate phone number
    const formattedPhone = validateVietnamesePhone(phoneNumber);
    if (!formattedPhone) {
      throw createError('Số điện thoại không hợp lệ', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: formattedPhone });
    if (existingUser) {
      throw createError('Số điện thoại đã được đăng ký', 409);
    }

    // Verify OTP
    const otpResult = await verifyOTP(formattedPhone, otpCode, 'register');
    if (!otpResult.success) {
      throw createError(otpResult.message, 400);
    }

    // Create new user
    const userData: any = {
      phoneNumber: formattedPhone,
      phoneNumberVerified: true,
      role: 'driver',
      status: 'active'
    };

    if (password) {
      userData.password = password;
    }

    if (fullName) {
      userData.fullName = fullName;
    }

    const user = new User(userData);
    await user.save();

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      role: user.role
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          role: user.role,
          phoneNumberVerified: user.phoneNumberVerified
        },
        tokens
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Login with phone number and OTP or password
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, otpCode, password } = req.body;

    if (!phoneNumber) {
      throw createError('Số điện thoại là bắt buộc', 400);
    }

    // Validate phone number
    const formattedPhone = validateVietnamesePhone(phoneNumber);
    if (!formattedPhone) {
      throw createError('Số điện thoại không hợp lệ', 400);
    }

    // Find user
    const user = await User.findOne({ phoneNumber: formattedPhone }).select('+password');
    if (!user) {
      throw createError('Số điện thoại chưa được đăng ký', 404);
    }

    // Check user status
    if (user.status !== 'active') {
      throw createError('Tài khoản đã bị khóa hoặc vô hiệu hóa', 403);
    }

    // Verify authentication method
    if (otpCode) {
      // OTP login
      const otpResult = await verifyOTP(formattedPhone, otpCode, 'login');
      if (!otpResult.success) {
        throw createError(otpResult.message, 400);
      }
    } else if (password) {
      // Password login
      if (!user.password) {
        throw createError('Tài khoản chưa có mật khẩu. Vui lòng đăng nhập bằng OTP', 400);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw createError('Mật khẩu không đúng', 401);
      }
    } else {
      throw createError('Vui lòng cung cấp mã OTP hoặc mật khẩu', 400);
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      role: user.role
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          role: user.role,
          phoneNumberVerified: user.phoneNumberVerified
        },
        tokens
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      throw createError('Chưa xác thực', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('Người dùng không tồn tại', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          phoneNumberVerified: user.phoneNumberVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token là bắt buộc', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw createError('Người dùng không tồn tại hoặc đã bị khóa', 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
      role: user.role
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Reset password with OTP verification
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, otpCode, newPassword } = req.body;

    if (!phoneNumber || !otpCode || !newPassword) {
      throw createError('Số điện thoại, mã OTP và mật khẩu mới là bắt buộc', 400);
    }

    // Validate phone number
    const formattedPhone = validateVietnamesePhone(phoneNumber);
    if (!formattedPhone) {
      throw createError('Số điện thoại không hợp lệ', 400);
    }

    // Find user
    const user = await User.findOne({ phoneNumber: formattedPhone }).select('+password');
    if (!user) {
      throw createError('Số điện thoại chưa được đăng ký', 404);
    }

    // Verify OTP
    const otpResult = await verifyOTP(formattedPhone, otpCode, 'reset_password');
    if (!otpResult.success) {
      throw createError(otpResult.message, 400);
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw createError('Mật khẩu mới phải có ít nhất 6 ký tự', 400);
    }

    // Update password (will be hashed automatically by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    });
  } catch (error: any) {
    next(error);
  }
};

