const FILES_TO_CACHE = [
    "/",
  "/index.html",
  "/manifest.webmanifest",
  "/styles.css",
  "/db.js",
  "/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-256x256.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
]; 
const CACHE_NAME='budget-runtime-cache';
const DATA_CACHE_NAME = 'budget-static-cache';


//installation time
self.addEventListener('install', function(data) {
    data.waitUntil(
        caches.open(DATA_CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(()=>self.skipWaiting())
    )
});

//activation
self.addEventListener("activate", (data) => {
    data.waitUntil(
        caches.keys()
        .then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    console.log('removing old cache data', key);
                    return caches.delete(key);
                })
            )
        })
    )
    self.clients.claim();
});

//fetching
self.addEventListener('fetch', (data) => {
    if(data.request.url.includes("/api/")){
        data.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(data.request)
                .then(res => {
                    if(res.status ===200){
                        cache.put(data.request.url, res.clone());
                    }
                    return res;
                })
                .catch(err => {
                    return cache.match(data.request);
                })
            })
            .catch(err => {
                console.log(err);
            })
        )
        return;
    }

    data.respondWith(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.match(data.request)
            .then(res => {
                return res || fetch(data.request);
            })
        })
    )
})