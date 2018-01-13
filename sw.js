var dataCacheName = 'AlphaGo-Teach-Data-v0.1';
var cacheName = 'AlphaGo-Teach-v0.1';
var filesToCache = [
  'index.html',
  'dist/img/goboard.png',
  'dist/css/main.css',
  'dist/img/icons/logo-text.svg',
  'dist/fonts/aileron-bold-webfont.woff2',
  'dist/fonts/aileron-light-webfont.woff2',
  'dist/fonts/Mikro-Regular.woff2',
  'dist/fonts/Mikro-Light.woff2',
  'dist/files/book.sgf',
  'dist/js/main.js',
  'dist/js/vendor/wgo.js',
  'dist/img/board-background.jpg',
  'sw.js',
  'manifest.json'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});
self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        return response
      }
      return fetch(e.request.url)
    })
  )
})




