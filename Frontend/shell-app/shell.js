import { eventBus } from '../shared/event-bus.js';

const TOKEN_KEY = 'token';

function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  eventBus.emit('LOGOUT');
}

// Make logout function globally available
window.logout = logout;

// Route guard
window.addEventListener('hashchange', () => {
  if (!isLoggedIn() && location.hash !== '#/login' && location.hash !== '#/') {
    location.hash = '/';
  }
});

// Event listeners
eventBus.on('LOGIN_SUCCESS', (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  location.hash = '/profile';
});

eventBus.on('LOGOUT', () => {
  location.hash = '/';
});
