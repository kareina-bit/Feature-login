import { API_CONFIG, STORAGE_KEYS } from '../../config/env.js';

/**
 * Get auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Set auth token to localStorage
 */
export const setAuthToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Save user data to localStorage
 */
export const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Make HTTP request to backend API
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Mặc định là JSON, nhưng cho phép ghi đè nếu options.headers có Content-Type khác
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const headers = {
    ...defaultHeaders,
    ...options.headers // Header truyền vào sẽ ghi đè mặc định
  };

  // Nếu gửi FormData (upload ảnh) thì xoá Content-Type để trình duyệt tự set boundary
  if (options.body instanceof FormData) {
      delete headers['Content-Type'];
  }

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...options
  };

  // Add body logic: Chỉ stringify nếu nó là object thuần (không phải FormData/URLSearchParams)
  if (options.body) {
    if (options.body instanceof FormData || options.body instanceof URLSearchParams) {
        config.body = options.body; // Giữ nguyên, không stringify
    } else {
        config.body = JSON.stringify(options.body); // JSON thường
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Ném ra object lỗi đầy đủ để catch bên ngoài đọc được detail
      throw new Error(data.detail || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * API Methods
 */

// Auth APIs
export const sendOTP = async (phone, purpose = 'register') => {
  // Node.js backend expects "purpose" field
  return await apiRequest(API_CONFIG.ENDPOINTS.SEND_OTP, {
    method: 'POST',
    body: { phone, purpose }
  });
};

export const verifyOTP = async (phone, otp, purpose = 'register') => {
  // Node.js backend expects "purpose" field
  return await apiRequest(API_CONFIG.ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    body: { phone, otp, purpose }
  });
};

export const register = async (userData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
    method: 'POST',
    body: userData
  });
};

export const login = async (phone, password) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
    method: 'POST',
    body: { phone, password }
  });
};

export const resetPassword = async (phone, otp, newPassword) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    body: { phone, otp, newPassword }
  });
};

export const getCurrentUser = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_ME);
};

// User APIs
export const getProfile = async () => {
  return await apiRequest(API_CONFIG.ENDPOINTS.GET_PROFILE);
};

export const updateProfile = async (profileData) => {
  return await apiRequest(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, {
    method: 'PUT',
    body: profileData
  });
};

// Legacy compatibility (for old code if any)
export const getUsers = () => {
  console.warn('getUsers() is deprecated. Use API calls instead.');
  return [];
};

export const saveUsers = () => {
  console.warn('saveUsers() is deprecated. Use API calls instead.');
};

export const findUser = () => {
  console.warn('findUser() is deprecated. Use API calls instead.');
  return null;
};

