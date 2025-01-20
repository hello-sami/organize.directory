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

  // Handle city pages with clean URLs
  const citySlug = url.pathname.slice(1); // Remove leading slash
  if (citySlug && !citySlug.includes('/') && !citySlug.endsWith('.html')) {
    try {
      // Attempt to fetch the city page from the cities directory
      const cityResponse = await fetch(new URL(`/cities/${citySlug}.html`, url.origin));
      if (cityResponse.ok) {
        // Create a new response with the same body but the clean URL
        const newResponse = new Response(cityResponse.body, cityResponse);
        return newResponse;
      }
    } catch (error) {
      // If fetch fails, continue to next middleware
      console.error('Error fetching city page:', error);
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