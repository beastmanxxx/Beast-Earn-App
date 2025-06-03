const CACHE_NAME = 'beast-earn-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.avif',
    '/color.png',
    '/mine.png',
    '/color.mp3',
    '/mine.mp3',
    '/main.mp3',
    '/dw.mp3',
    '/error.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 