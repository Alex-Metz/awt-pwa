// cache names
const STATIC_CACHE = 'static-site-cache';
const DYNAMIC_CHACHE = 'dynamic-site-cache';

// static resources
const STATIC_CACHE_LIST = [
  '/awt-pwa/', '/awt-pwa/data/videos.json', '/awt-pwa/manifest.json',
  '/awt-pwa/favicon.ico'
];

// caches static resources
self.addEventListener('install', function(event) {
  console.log('Caching static resources.');
  event.waitUntil(
      caches.open(STATIC_CACHE)
          .then(function(cache) {
            return cache.addAll(STATIC_CACHE_LIST);
          })
          .then(self.skipWaiting())  // run new service worker right away
          .catch(
              error => console.log(
                  'An Error occured while caching static resources! Error:',
                  error)));
});


// garbage collector for old caches
self.addEventListener('activate', function(event) {
  // checks of cache types
  console.log('Deleting old cache.');
  let cacheList = [STATIC_CACHE, DYNAMIC_CHACHE];
  event.waitUntil(
      caches.keys()
          .then(function(cacheNames) {
            return cacheNames.filter(
                cacheName =>
                    !cacheList.includes(cacheName));  // find old caches
          })
          .then(function(cachesToDelete) {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
              return caches.delete(cacheToDelete);  // delete cache
            }));
          })
          .then(() => self.clients.claim())
          .catch(
              error => console.log(
                  'An Error occured while deleting the old cache! Error:',
                  error)));
});


// handle fetch events
self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(cachedResp) {
    // try to find cached resources
    if (cachedResp) {
      return cachedResp;
    } else {
      // fallback: make network request and cache new resources
      return caches.open(DYNAMIC_CHACHE).then(function(cache) {
        return fetch(event.request).then(function(resp) {
          return cache.put(event.request, resp.clone()).then(() => {
            return resp;
          });
        });
      });
    }
  }));
});
