import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Generate JWT Token
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  try {
    const { phone, name, password, role = 'user' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new Error('Số điện thoại đã được đăng ký');
    }

    // Create new user
    const user = await User.create({
      phone,
      name,
      password,
      role,
      isPhoneVerified: true // Since we verified OTP
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: user.toSafeObject()
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (phone, password) => {
  try {
    // Find user with password field
    const user = await User.findOne({ phone }).select('+password');
    
    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Mật khẩu không chính xác');
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: user.toSafeObject()
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (phone, newPassword) => {
  try {
    // Find user
    const user = await User.findOne({ phone });
    
    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    return user.toSafeObject();
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Prevent updating sensitive fields
    const allowedFields = ['name', 'email', 'avatar', 'driverInfo', 'companyInfo'];
    const updates = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    Object.assign(user, updates);
    await user.save();

    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: user.toSafeObject()
    };
  } catch (error) {
    throw error;
  }
};

export default {
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  resetPassword,
  getUserById,
  updateUserProfile
};

