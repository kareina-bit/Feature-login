import { verifyToken } from '../services/auth.service.js';
import User from '../models/User.model.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Vui lòng đăng nhập'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Check if user still exists
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa'
        });
      }

      // Attach user to request
      req.user = {
        userId: user._id,
        role: user.role,
        phone: user.phone
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' không có quyền truy cập tài nguyên này`
      });
    }

    next();
  };
};

export default {
  protect,
  authorize
};

