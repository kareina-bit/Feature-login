const TOKEN_KEY = 'token';

function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  EventBus.emit('LOGOUT');
}

// Route guard
window.addEventListener('hashchange', () => {
  if (!isLoggedIn() && location.hash !== '#/login') {
    location.hash = '/login';
  }
});

// Event listeners
EventBus.on('LOGIN_SUCCESS', (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  location.hash = '/profile';
});

EventBus.on('LOGOUT', () => {
  location.hash = '/login';
});
