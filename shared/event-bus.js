/**
 * Simple Event Bus for cross-module communication
 * Allows decoupled communication between services
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event
   */
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.events = {};
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Auth event constants
export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILED: 'auth:login:failed',
  REGISTER_SUCCESS: 'auth:register:success',
  REGISTER_FAILED: 'auth:register:failed',
  LOGOUT: 'auth:logout',
  TOKEN_EXPIRED: 'auth:token:expired'
};

export default eventBus;

