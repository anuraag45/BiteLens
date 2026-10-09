/* ==========================================================================
   BiteLens Mobile PWA Service Worker (v2.4.0)
   Enables 100% offline barcode scanning, OCR analysis & catalog lookup
   across all 10 production routes:
   index · scan · additives · compare · health-calculator · learn · dashboard · download · about · report
   ========================================================================== */

const CACHE_NAME = 'bitelens-pwa-v2.4';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './scan.html',
  './additives.html',
  './compare.html',
  './health-calculator.html',
  './learn.html',
  './dashboard.html',
  './download.html',
  './about.html',
  './report.html',
  './manifest.json',
  './styles/main.css',
  './js/components.js',
  './js/analyze.js',
  './js/additive-database.js',
  './js/data/products.json'
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

  // For Open Food Facts API, use Network-First with cache fallback
  if (request.url.includes('world.openfoodfacts.org')) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // Cache-first for core app shell assets
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
          return caches.match('./scan.html') || caches.match('./index.html');
        }
      });
    })
  );
});
