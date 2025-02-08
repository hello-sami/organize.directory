export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Remove trailing slash
    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;

    // Handle root path
    if (cleanPath === '') {
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    }

    // Handle main pages
    if (['/about', '/location', '/issues', '/resources'].includes(cleanPath)) {
      return env.ASSETS.fetch(new Request(`${url.origin}${cleanPath}.html`, request));
    }

    // Handle posts, cities, and issues with prefixes
    if (cleanPath.startsWith('/posts/') || cleanPath.startsWith('/cities/') || cleanPath.startsWith('/issues/')) {
      return env.ASSETS.fetch(new Request(`${url.origin}${cleanPath}.html`, request));
    }

    // Try to serve as a state page
    try {
      const stateResponse = await env.ASSETS.fetch(new Request(`${url.origin}/states${cleanPath}.html`, request));
      if (stateResponse.ok) {
        return stateResponse;
      }
    } catch (e) {
      // State page not found, continue to next check
    }

    // Try to serve as a city page
    try {
      const cityResponse = await env.ASSETS.fetch(new Request(`${url.origin}/cities${cleanPath}.html`, request));
      if (cityResponse.ok) {
        return cityResponse;
      }
    } catch (e) {
      // City page not found, continue to 404
    }

    // If nothing matched, return 404
    return env.ASSETS.fetch(new Request(`${url.origin}/404.html`, request));
  }
}; 