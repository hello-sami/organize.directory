import fs from 'fs/promises';
import path from 'path';

async function buildCityList() {
  try {
    // Read all files in the cities directory
    const citiesDir = path.join(process.cwd(), 'cities');
    const files = await fs.readdir(citiesDir);
    
    // Filter for .html files and remove the extension
    const cityNames = files
      .filter(file => file.endsWith('.html'))
      .map(file => file.replace('.html', ''))
      .sort();

    // Generate the middleware file content
    const middlewareContent = `export async function onRequest({ request, next }) {
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
    const response = await fetch(new URL(\`\${path}.html\`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // Handle posts with clean URLs
  if (path.startsWith('/posts/')) {
    const response = await fetch(new URL(\`\${path}.html\`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // List of cities (auto-generated)
  const cityNames = ${JSON.stringify(cityNames, null, 2)};

  // Handle city pages with clean URLs
  const cityPath = path.slice(1); // Remove leading slash
  if (cityNames.includes(cityPath)) {
    const response = await fetch(new URL(\`/\${cityPath}.html\`, url.origin));
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
    const response = await fetch(new URL(\`/\${statePath}.html\`, url.origin));
    if (!response.ok) return next();
    return new Response(response.body, response);
  }

  // If no matches, continue to next middleware/static file handling
  return next();
}`;

    // Write the new middleware file
    await fs.writeFile(
      path.join(process.cwd(), 'functions', '_middleware.js'),
      middlewareContent,
      'utf8'
    );

    console.log('Successfully generated middleware with', cityNames.length, 'cities');
  } catch (error) {
    console.error('Error building city list:', error);
    process.exit(1);
  }
}

buildCityList(); 