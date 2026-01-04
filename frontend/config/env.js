// API Configuration
export const API_CONFIG = {
  // Backend API URL
  BASE_URL: 'http://localhost:5000/api',
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    RESET_PASSWORD: '/auth/reset-password',
    GET_ME: '/auth/me',
    
    // Users
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    GET_USERS: '/users',
    UPDATE_DRIVER_INFO: '/users/driver/info'
  }
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'shipway_token',
  USER_DATA: 'shipway_user',
  REMEMBER_ME: 'shipway_remember'
};

export default API_CONFIG;

