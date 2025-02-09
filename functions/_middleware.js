export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle root path
  if (path === '/') {
    const response = await fetch(new URL('/index.html', url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // Handle static pages
  const staticPages = ['about', 'location', 'issues', 'resources'];
  if (staticPages.includes(path.slice(1))) {
    const response = await fetch(new URL(`${path}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // Handle posts with clean URLs
  if (path.startsWith('/posts/')) {
    const response = await fetch(new URL(`${path}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // List of cities (you can expand this list)
  const cityNames = [
    'detroit', 'lansing', 'ypsilanti', 'ann-arbor', 'grand-rapids',
    'chicago', 'springfield', 'st-louis', 'kansas-city', 'portland',
    'seattle', 'tucson', 'phoenix', 'albuquerque', 'denver',
    'austin', 'houston', 'dallas', 'san-antonio', 'new-orleans',
    'miami', 'atlanta', 'charlotte', 'nashville', 'louisville',
    'indianapolis', 'columbus', 'cleveland', 'cincinnati', 'pittsburgh',
    'philadelphia', 'new-york', 'boston', 'baltimore', 'washington-dc'
  ];

  // Handle city pages with clean URLs
  const cityPath = path.slice(1); // Remove leading slash
  if (cityNames.includes(cityPath)) {
    const response = await fetch(new URL(`/cities/${cityPath}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // Handle state pages with clean URLs
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

  const statePath = path.slice(1);
  if (stateNames.includes(statePath)) {
    const response = await fetch(new URL(`/states/${statePath}.html`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // If no matches, continue to next middleware/static file handling
  return next();
} 