// API Configuration
export const API_CONFIG = {
  // Backend API URL
  // Use port 8000 for FastAPI backend, or 5000 for Node.js backend
  BASE_URL: 'http://localhost:8000/api',
  
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

