// API Configuration for Shipway Backend
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    OTP_REQUEST: '/api/v1/auth/otp/request',
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    PROFILE: '/api/v1/auth/profile',
    REFRESH: '/api/v1/auth/refresh',
    RESET_PASSWORD: '/api/v1/auth/password/reset'
  }
};

// API Helper functions
const API = {
  /**
   * Request OTP for registration or login
   */
  async requestOTP(phoneNumber, purpose) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.OTP_REQUEST}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber, purpose })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to request OTP');
    }
    
    return data;
  },

  /**
   * Register new user
   */
  async register(phoneNumber, otpCode, password, fullName) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        otpCode,
        password,
        fullName
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  },

  /**
   * Login with phone and password
   */
  async login(phoneNumber, password) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  },

  /**
   * Login with phone and OTP
   */
  async loginWithOTP(phoneNumber, otpCode) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        otpCode
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  },

  /**
   * Get user profile
   */
  async getProfile(accessToken) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get profile');
    }
    
    return data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }
    
    return data;
  },

  /**
   * Reset password with OTP verification
   */
  async resetPassword(phoneNumber, otpCode, newPassword) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        otpCode,
        newPassword
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }
    
    return data;
  }
};

// Token management
const TokenManager = {
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('shipway_access_token', accessToken);
    localStorage.setItem('shipway_refresh_token', refreshToken);
  },

  getAccessToken() {
    return localStorage.getItem('shipway_access_token');
  },

  getRefreshToken() {
    return localStorage.getItem('shipway_refresh_token');
  },

  clearTokens() {
    localStorage.removeItem('shipway_access_token');
    localStorage.removeItem('shipway_refresh_token');
  },

  isAuthenticated() {
    return !!this.getAccessToken();
  }
};

// User management
const UserManager = {
  setUser(user) {
    localStorage.setItem('shipway_user', JSON.stringify(user));
  },

  getUser() {
    const userStr = localStorage.getItem('shipway_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  clearUser() {
    localStorage.removeItem('shipway_user');
  },

  logout() {
    TokenManager.clearTokens();
    this.clearUser();
  }
};

