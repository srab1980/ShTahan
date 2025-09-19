/**
 * @file Service Worker for the website, providing offline capabilities and caching.
 * @description Implements caching strategies (Cache First) and handles push notifications.
 */

const CACHE_NAME = 'tahhan-site-cache-v2';
const OFFLINE_URL = '/static/offline.html';
const STATIC_ASSETS = [
    '/',
    OFFLINE_URL,
    '/static/css/style.css',
    '/static/js/main.js',
    // Add other critical assets here
];

/**
 * Handles the 'install' event of the service worker.
 * Caches essential static assets for offline use.
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .catch(err => console.error('Service Worker installation failed:', err))
    );
});

/**
 * Handles the 'activate' event.
 * Cleans up old caches to ensure the user has the latest version.
 */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                         .map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

/**
 * Handles the 'fetch' event.
 * Implements a Cache First strategy, falling back to the network.
 * If the network fails for navigation, it serves a custom offline page.
 */
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        })
    );
});

/**
 * Handles the 'push' event for web push notifications.
 * @param {PushEvent} event - The push event.
 */
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'موقع الشيخ مصطفى الطحان', body: 'تم تحديث المحتوى' };
    const options = {
        body: data.body,
        icon: '/static/img/icons/icon-192x192.png',
        badge: '/static/img/icons/badge-96x96.png',
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

/**
 * Handles the 'notificationclick' event.
 * Focuses on an existing window or opens a new one when a notification is clicked.
 */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});