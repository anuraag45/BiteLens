/* ==========================================================================
   BiteLens Mobile PWA Service Worker (v1.0.0)
   Enables 100% offline barcode scanning & catalog lookup in grocery aisles.
   ========================================================================== */

const CACHE_NAME = 'bitelens-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/app.html',
  '/manifest.json',
  '/js/mobileApp.js',
  '/js/html5-qrcode.min.js',
  '/js/data/indianProductsCatalog.js',
  'https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Some offline assets failed to precache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // For Open Food Facts API, use Network-First
  if (request.url.includes('openfoodfacts.org')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-First strategy for local scripts, styles, catalog
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML navigations
        if (request.mode === 'navigate') {
          return caches.match('/app.html');
        }
      });
    })
  );
});
