import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Admin only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:userId', authorize('admin'), userController.getUserById);
router.put('/:userId/status', authorize('admin'), userController.updateUserStatus);
router.delete('/:userId', authorize('admin'), userController.deleteUser);

// Driver specific routes
router.put('/driver/info', authorize('driver'), userController.updateDriverInfo);
router.get('/drivers', authorize('admin'), userController.getAllDrivers);

export default router;

