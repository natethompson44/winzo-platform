// WINZO Cache Buster - Force Fresh Load
(function() {
  'use strict';
  
  console.log('WINZO Cache Buster: Starting cache cleanup...');
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('Cache Buster: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('Cache Buster: All caches cleared successfully');
    }).catch(function(error) {
      console.error('Cache Buster: Error clearing caches:', error);
    });
  }
  
  // Clear localStorage and sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Cache Buster: Local storage cleared');
  } catch (error) {
    console.error('Cache Buster: Error clearing storage:', error);
  }
  
  // Unregister service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Cache Buster: Service worker unregistered');
      }
    });
  }
  
  // Force reload with cache bypass
  setTimeout(function() {
    console.log('Cache Buster: Reloading page...');
    window.location.reload(true);
  }, 1000);
})(); 