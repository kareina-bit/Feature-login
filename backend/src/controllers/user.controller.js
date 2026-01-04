import User from '../models/User.model.js';
import * as authService from '../services/auth.service.js';

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
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

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateUserProfile(req.user.userId, req.body);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query = {};
    
    // Filter by role
    if (role) {
      query.role = role;
    }

    // Search by name or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/:userId/status
 * @desc    Update user status (Admin only)
 * @access  Private/Admin
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản admin'
      });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/driver/info
 * @desc    Update driver information
 * @access  Private/Driver
 */
export const updateDriverInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    const { licenseNumber, vehicleType, vehiclePlate } = req.body;

    user.driverInfo = {
      ...user.driverInfo,
      licenseNumber,
      vehicleType,
      vehiclePlate
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin tài xế thành công',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/drivers
 * @desc    Get all drivers (Admin only)
 * @access  Private/Admin
 */
export const getAllDrivers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isVerified } = req.query;

    const query = { role: 'driver' };
    
    if (isVerified !== undefined) {
      query['driverInfo.isVerified'] = isVerified === 'true';
    }

    const drivers = await User.find(query)
      .select('-password -refreshToken')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      drivers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  updateDriverInfo,
  getAllDrivers
};

