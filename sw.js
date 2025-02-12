const CACHE_NAME = 'organize-directory-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/styles.css',
  '/mobile-menu.js',
  '/theme.js',
  '/search.js',
  '/components/sidebar.js',
  '/script.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  // Special handling for search-index.js
  if (event.request.url.includes('search-index.js')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              // Cache the updated version
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, networkResponse.clone()));
              return networkResponse;
            });
          // Return cached version first, then update cache in background
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // Standard cache-first strategy for other assets
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => cachedResponse || fetch(event.request))
  );
}); 