export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  
  // Handle static assets directly
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    return next();
  }

  // Handle main pages
  if (url.pathname === '/cities') {
    url.pathname = '/cities.html';
    return next();
  }
  if (url.pathname === '/issues') {
    url.pathname = '/issues.html';
    return next();
  }
  if (url.pathname === '/about') {
    url.pathname = '/about.html';
    return next();
  }

  // Handle city pages
  if (url.pathname.startsWith('/cities/') && !url.pathname.endsWith('.html')) {
    url.pathname = `${url.pathname}.html`;
    return next();
  }

  // Handle root
  if (url.pathname === '/') {
    url.pathname = '/index.html';
    return next();
  }

  // Pass through all other requests
  return next();
} 