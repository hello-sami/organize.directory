export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle static assets
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
      return fetch(request);
    }

    // Handle main pages
    if (url.pathname === '/cities') {
      return fetch(new Request(new URL('/cities.html', url.origin)));
    }
    if (url.pathname === '/issues') {
      return fetch(new Request(new URL('/issues.html', url.origin)));
    }
    if (url.pathname === '/about') {
      return fetch(new Request(new URL('/about.html', url.origin)));
    }

    // Handle city pages
    if (url.pathname.startsWith('/cities/')) {
      const cityPath = url.pathname + '.html';
      return fetch(new Request(new URL(cityPath, url.origin)));
    }

    // Handle root
    if (url.pathname === '/') {
      return fetch(new Request(new URL('/index.html', url.origin)));
    }

    // Serve the requested file directly
    return fetch(request);
  }
}; 