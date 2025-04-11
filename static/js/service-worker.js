/**
 * Service Worker for Sheikh Mustafa Al-Tahhan website
 * Provides offline capabilities and faster loading
 */

const CACHE_NAME = 'tahhan-site-cache-v1';
const OFFLINE_PAGE = '/static/offline.html';
const OFFLINE_IMAGE = '/static/img/offline-image.png';

// Assets to cache immediately on service worker install
const STATIC_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/main.js',
  '/static/js/books.js',
  '/static/js/articles.js',
  '/static/js/gallery.js',
  '/static/js/contact.js',
  '/static/js/scroll-animations.js',
  '/static/js/back-to-top.js',
  '/static/img/profile/Mustafa_tahhan.jpg',
  OFFLINE_PAGE,
  OFFLINE_IMAGE
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
  
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetching resource:', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise try to fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the fetched response for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_PAGE);
            }
            
            // For image requests, return a placeholder image
            if (event.request.destination === 'image') {
              return caches.match(OFFLINE_IMAGE);
            }
            
            // For other requests, just return an error response
            return new Response('Network error occurred', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Push notification event handler
self.addEventListener('push', event => {
  console.log('[Service Worker] Push notification received:', event);
  
  const title = 'موقع الشيخ مصطفى الطحان';
  const options = {
    body: event.data.text() || 'تم تحديث المحتوى',
    icon: '/static/img/icons/icon-192x192.png',
    badge: '/static/img/icons/badge-96x96.png',
    dir: 'rtl',
    lang: 'ar'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event);
  
  event.notification.close();
  
  // Open or focus main window when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        if (windowClients.length > 0) {
          return windowClients[0].focus();
        } else {
          return clients.openWindow('/');
        }
      })
  );
});