// Minimal Firebase Messaging Service Worker
// This file prevents the 404 error and allows LikeMinds SDK to initialize
// Push notifications are not fully enabled - can be added later if needed

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('Firebase messaging service worker installed');
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('Firebase messaging service worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle background messages (placeholder)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  // Notifications can be implemented here later if needed
});

