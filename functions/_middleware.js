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

  // Handle city pages - check if it's a valid city slug
  const citySlug = url.pathname.slice(1); // Remove leading slash
  if (citySlug && !citySlug.includes('/') && !citySlug.endsWith('.html')) {
    // Try to serve from cities directory
    const response = await fetch(new URL(`/cities/${citySlug}.html`, url.origin));
    if (response.ok) {
      return response;
    }
  }

  // Handle root
  if (url.pathname === '/') {
    url.pathname = '/index.html';
    return next();
  }

  // Pass through all other requests
  return next();
} 