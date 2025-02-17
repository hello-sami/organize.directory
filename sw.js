const CACHE_NAME = 'organize-directory-v1';
const STATIC_ASSETS = [
    '/',
    '/styles.css',
    '/script.js',
    '/theme.js',
    '/mobile-menu.js',
    '/search.js',
    '/components/sidebar.js',
    '/js/posts.js',
    '/js/analytics.js',
    '/js/search-init.js',
    '/fonts/inter-regular.woff2',
    '/fonts/inter-semibold.woff2',
    '/fonts/fonts.css'
];

// Separate cache for analytics data
const ANALYTICS_CACHE_NAME = 'analytics-cache-v1';
const ANALYTICS_QUEUE_NAME = 'analytics-queue-v1';

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME)
                .then(cache => cache.addAll(STATIC_ASSETS)),
            caches.open(ANALYTICS_CACHE_NAME),
            caches.open(ANALYTICS_QUEUE_NAME)
        ]).then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => 
                            ![CACHE_NAME, ANALYTICS_CACHE_NAME, ANALYTICS_QUEUE_NAME]
                                .includes(cacheName)
                        )
                        .map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
            .then(() => {
                // Attempt to replay queued analytics requests
                return replayQueuedAnalytics();
            })
    );
});

// Helper function to determine if a request is for analytics
function isAnalyticsRequest(url) {
    return url.pathname.startsWith('/analytics/') || 
           url.pathname.includes('/collect') ||
           url.hostname.includes('analytics');
}

// Helper function to determine if a request is for fonts
function isFontRequest(url) {
    return url.pathname.endsWith('.woff2') || 
           url.pathname.endsWith('.woff') || 
           url.pathname.endsWith('.ttf') ||
           url.pathname.includes('/fonts/');
}

// Function to queue failed analytics requests
async function queueAnalyticsRequest(request) {
    const cache = await caches.open(ANALYTICS_QUEUE_NAME);
    const timestamp = Date.now();
    const queueKey = `${timestamp}-${Math.random()}`;
    await cache.put(queueKey, request);
    return true;
}

// Function to replay queued analytics requests
async function replayQueuedAnalytics() {
    const cache = await caches.open(ANALYTICS_QUEUE_NAME);
    const keys = await cache.keys();
    
    return Promise.all(keys.map(async (key) => {
        const request = await cache.match(key);
        try {
            const response = await fetch(request.clone());
            if (response.ok) {
                await cache.delete(key);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to replay analytics request:', error);
            return false;
        }
    }));
}

// Fetch event handler
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Handle analytics requests
    if (isAnalyticsRequest(url)) {
        event.respondWith(
            fetch(event.request.clone())
                .catch(error => {
                    console.error('Analytics request failed:', error);
                    // Queue failed analytics requests
                    return queueAnalyticsRequest(event.request.clone())
                        .then(() => new Response(null, { status: 202 }));
                })
        );
        return;
    }

    // Handle font requests - cache first, then network
    if (isFontRequest(url)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request)
                        .then(networkResponse => {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                            return networkResponse;
                        });
                })
        );
        return;
    }

    // Network-first strategy for HTML files
    if (event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first strategy for static assets
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
        return;
    }

    // Network-first strategy for everything else
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
}); 