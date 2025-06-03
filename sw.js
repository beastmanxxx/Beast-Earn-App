const CACHE_NAME = 'beast-earn-v1';
const urlsToCache = [
    'https://beastmanxxx.github.io/Beast-Earn-App/',
    'https://beastmanxxx.github.io/Beast-Earn-App/index.html',
    'https://beastmanxxx.github.io/Beast-Earn-App/logo.avif',
    'https://beastmanxxx.github.io/Beast-Earn-App/manifest.json',
    'https://beastmanxxx.github.io/Beast-Earn-App/color.png',
    'https://beastmanxxx.github.io/Beast-Earn-App/mine.png',
    'https://beastmanxxx.github.io/Beast-Earn-App/coin.png',
    'https://beastmanxxx.github.io/Beast-Earn-App/boom.png',
    'https://beastmanxxx.github.io/Beast-Earn-App/qr.png',
    'https://beastmanxxx.github.io/Beast-Earn-App/auth.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/color.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/mine.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/main.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/deposite.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/withdraw.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/history.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/dw.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/error.mp3',
    'https://beastmanxxx.github.io/Beast-Earn-App/boom.mp3'
];

// Install event - cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Handle navigation requests
self.addEventListener('navigate', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
}); 
