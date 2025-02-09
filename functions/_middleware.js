export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle root path
  if (path === '/') {
    return next();
  }

  // Handle static pages
  const staticPages = ['about', 'location', 'issues', 'resources'];
  if (staticPages.includes(path.slice(1))) {
    const response = await fetch(new URL(path + '.html', url.origin));
    return new Response(response.body, response);
  }

  // Handle dynamic routes (posts, cities)
  if (path.startsWith('/posts/') || path.startsWith('/cities/')) {
    const response = await fetch(new URL(path + '.html', url.origin));
    return new Response(response.body, response);
  }

  // Handle state pages (clean URLs)
  const stateNames = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
    'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
    'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
    'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
    'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
    'new-hampshire', 'new-jersey', 'new-mexico', 'new-york',
    'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon',
    'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
    'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
    'west-virginia', 'wisconsin', 'wyoming'
  ];

  const statePath = path.slice(1); // Remove leading slash
  if (stateNames.includes(statePath)) {
    const response = await fetch(new URL(`/states/${statePath}.html`, url.origin));
    return new Response(response.body, response);
  }

  // If no matches, continue to next middleware/static file handling
  return next();
} 