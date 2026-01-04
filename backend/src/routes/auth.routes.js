import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  registerValidation,
  loginValidation,
  sendOTPValidation,
  resetPasswordValidation
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/send-otp', sendOTPValidation, authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);

export default router;

