/* eslint-disable no-restricted-globals */

// Service Worker for Amorra PWA
const CACHE_NAME = 'amorra-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/site.webmanifest',
    '/favicon.ico',
    '/app-interface.png',
    '/login-bg.png',
    '/placeholder.svg'
];

// Install Event: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Pre-caching offline assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event: Cache-First strategy for static assets, Network-First for others
self.addEventListener('fetch', (event) => {
    // We only want to handle same-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Only cache valid responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            });
        }).catch(() => {
            // Fallback to index.html for navigation requests (SPA support)
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        })
    );
});
