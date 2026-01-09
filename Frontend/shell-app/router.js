const routes = {
  '/': '../onboarding-fe/index.html',
  '/login': '../auth-service/index.html',
  '/profile': '../profile-service/index.html',
  '/wallet': '../wallet-fe/index.html'
};

// Store loaded CSS links to manage them
let loadedCssLinks = new Set();

function cleanupCss() {
  // Remove CSS links that were added by microservices
  document.querySelectorAll('link[data-micro-service]').forEach(link => {
    link.remove();
  });
  loadedCssLinks.clear();
}

function loadRoute() {
  const path = location.hash.replace('#', '') || '/';
  const url = routes[path];

  if (!url) {
    document.getElementById('app').innerHTML = '404';
    return;
  }

  // Clean up previous CSS
  cleanupCss();

  fetch(url)
    .then(res => res.text())
    .then(html => {
      // Fix relative paths in HTML for CSS and assets
      const fixedHtml = html
        .replace(/href="css\//g, `href="${url.replace('index.html', '')}css/`)
        .replace(/src="assets\//g, `src="${url.replace('index.html', '')}assets/`)
        .replace(/src="img\//g, `src="${url.replace('index.html', '')}img/`)
        .replace(/href="auth\.css"/g, `href="${url.replace('index.html', '')}auth.css"`);
      
      document.getElementById('app').innerHTML = fixedHtml;
      
      // Load CSS dynamically
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = fixedHtml;
      const cssLinks = tempDiv.querySelectorAll('link[rel="stylesheet"]');
      cssLinks.forEach(link => {
        const cssHref = link.getAttribute('href');
        if (!loadedCssLinks.has(cssHref)) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = cssHref;
          cssLink.setAttribute('data-micro-service', 'true');
          document.head.appendChild(cssLink);
          loadedCssLinks.add(cssHref);
        }
      });
    });
}

window.addEventListener('hashchange', loadRoute);
loadRoute();
