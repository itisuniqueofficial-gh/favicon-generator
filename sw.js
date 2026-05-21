const CACHE_NAME = 'static-favicon-generator-v2';
const APP_SHELL = ['/', '/index.html', '/assets/css/style.css', '/assets/css/responsive.css', '/assets/js/app.js', '/assets/js/image-processor.js', '/assets/js/icon-generator.js', '/assets/js/zip-generator.js', '/assets/js/validators.js', '/assets/js/snippets.js', '/assets/js/pwa.js', '/assets/images/favicon.svg', '/assets/images/og-image.svg', '/manifest.json', '/site.webmanifest', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && new URL(event.request.url).origin === location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match('/offline.html'))));
});
