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

  // List of known issue slugs
  const issuesSlugs = [
    'housing-rights',
    'food-security',
    'healthcare',
    'environmental-justice',
    'workers-rights'
  ];

  // Handle clean URLs
  const slug = url.pathname.slice(1); // Remove leading slash
  if (slug && !slug.includes('/') && !slug.endsWith('.html')) {
    // Check if it's an issue page first
    if (issuesSlugs.includes(slug)) {
      const issueResponse = await fetch(new URL(`/issues/${slug}.html`, url.origin));
      if (issueResponse.ok) {
        return issueResponse;
      }
    }
    
    // If not an issue, try city page
    const cityResponse = await fetch(new URL(`/cities/${slug}.html`, url.origin));
    if (cityResponse.ok) {
      return cityResponse;
    }
  }

  // Handle direct access to HTML files in subdirectories
  if ((url.pathname.startsWith('/cities/') || url.pathname.startsWith('/issues/')) && 
      url.pathname.endsWith('.html')) {
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