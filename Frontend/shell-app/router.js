const routes = {
  '/login': '../auth-service/index.html',
  '/profile': '../profile-service/index.html'
};

function loadRoute() {
  const path = location.hash.replace('#', '') || '/login';
  const url = routes[path];

  if (!url) {
    document.getElementById('app').innerHTML = '404';
    return;
  }

  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;
    });
}

window.addEventListener('hashchange', loadRoute);
loadRoute();
