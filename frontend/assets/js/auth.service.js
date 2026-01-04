import * as api from './api.js';

/**
 * Register new user
 */
export const registerUser = async ({ phone, name, password, role = 'user', otp }) => {
  try {
    const countryCode = document.getElementById('regCountry')?.value || '+84';
    const fullPhone = phone.startsWith('+') ? phone : `${countryCode}${phone}`;

    const response = await api.register({
      phone: fullPhone,
      name,
      password,
      role,
      otp
    });

    // Save token and user data
    if (response.token) {
      api.setAuthToken(response.token);
      api.saveUser(response.user);
    }

    return response;
  } catch (error) {
    throw error.message || 'Đăng ký thất bại';
  }
};

/**
 * Login user
 */
export const loginUser = async (phone, password) => {
  try {
    const countryCode = document.getElementById('loginCountry')?.value || '+84';
    const fullPhone = phone.startsWith('+') ? phone : `${countryCode}${phone}`;

    const response = await api.login(fullPhone, password);

    // Save token and user data
    if (response.token) {
      api.setAuthToken(response.token);
      api.saveUser(response.user);
    }

    return response;
  } catch (error) {
    throw error.message || 'Đăng nhập thất bại';
  }
};

/**
 * Send OTP
 */
export const sendOtp = async (phone, opts = {}) => {
  try {
    const { requireUser = false, purpose = 'register' } = opts;
    
    // Get country code from appropriate select element
    let countryCode = '+84';
    if (purpose === 'register') {
      countryCode = document.getElementById('regCountry')?.value || '+84';
    } else if (purpose === 'reset-password') {
      countryCode = document.getElementById('resetCountry')?.value || '+84';
    }
    
    const fullPhone = phone.startsWith('+') ? phone : `${countryCode}${phone}`;

    const actualPurpose = requireUser ? 'reset-password' : purpose;
    const response = await api.sendOTP(fullPhone, actualPurpose);

    // Display OTP notification (for development)
    if (response.otp && typeof window !== 'undefined' && window.showOtpNotification) {
      window.showOtpNotification(fullPhone, response.otp);
    }

    // Log to console
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 MÃ OTP ĐÃ ĐƯỢC GỬI');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Số điện thoại: ${fullPhone}`);
    if (response.otp) {
      console.log(`   🔐 Mã OTP: ${response.otp}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return response;
  } catch (error) {
    throw error.message || 'Gửi OTP thất bại';
  }
};

/**
 * Verify OTP (client-side check - will be verified on server during register/reset)
 */
export const verifyOtp = async (phone, otp, purpose = 'register') => {
  try {
    // Get country code
    let countryCode = '+84';
    if (purpose === 'register') {
      countryCode = document.getElementById('regCountry')?.value || '+84';
    } else {
      countryCode = document.getElementById('resetCountry')?.value || '+84';
    }
    
    const fullPhone = phone.startsWith('+') ? phone : `${countryCode}${phone}`;

    const response = await api.verifyOTP(fullPhone, otp, purpose);
    
    if (!response.success) {
      throw new Error(response.message || 'OTP không hợp lệ');
    }

    return response;
  } catch (error) {
    throw error.message || 'Xác thực OTP thất bại';
  }
};

/**
 * Reset password
 */
export const resetPassword = async (phone, otp, newPassword) => {
  try {
    const countryCode = document.getElementById('resetCountry')?.value || '+84';
    const fullPhone = phone.startsWith('+') ? phone : `${countryCode}${phone}`;

    const response = await api.resetPassword(fullPhone, otp, newPassword);

    return response;
  } catch (error) {
    throw error.message || 'Đặt lại mật khẩu thất bại';
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  api.removeAuthToken();
  window.location.href = '/';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!api.getAuthToken();
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await api.getCurrentUser();
    return response.user;
  } catch (error) {
    // If token is invalid, logout
    logoutUser();
    throw error;
  }
};

export default {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  resetPassword,
  logoutUser,
  isAuthenticated,
  getCurrentUser
};

