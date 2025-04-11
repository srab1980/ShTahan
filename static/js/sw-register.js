/**
 * Service Worker Registration for Sheikh Mustafa Al-Tahhan website
 * Enables offline access and progressive web app functionality
 */

// Check if Service Worker is supported in the browser
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Register the service worker
    navigator.serviceWorker.register('/static/js/service-worker.js')
      .then(function(registration) {
        // Registration successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function(error) {
        // Registration failed
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}