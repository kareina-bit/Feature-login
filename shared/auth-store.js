/**
 * Auth Store - Centralized auth state management
 * Wrapper around localStorage for auth data
 */

const STORAGE_KEYS = {
  AUTH_TOKEN: 'shipway_token',
  USER_DATA: 'shipway_user',
};

/**
 * Auth Store object
 */
export const authStore = {
  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Set auth token
   */
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * Get user data
   */
  getUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Set user data
   */
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  /**
   * Check if user is authenticated
   */
  isAuth() {
    return !!this.getToken();
  },

  /**
   * Clear all auth data
   */
  clear() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }
};

export default authStore;

