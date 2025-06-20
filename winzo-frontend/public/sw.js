// WINZO Service Worker - Offline Functionality & Performance Optimization

// Dynamic cache names based on build time
const BUILD_TIME = Date.now();
const CACHE_VERSION = 'winzo-v2.0.0';
const STATIC_CACHE = `winzo-static-${CACHE_VERSION}-${BUILD_TIME}`;
const DYNAMIC_CACHE = `winzo-dynamic-${CACHE_VERSION}-${BUILD_TIME}`;
const API_CACHE = `winzo-api-${CACHE_VERSION}-${BUILD_TIME}`;

// Files to cache immediately (without hashes - they'll be handled dynamically)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/user/profile',
  '/api/betting/history',
  '/api/wallet/balance',
  '/api/sports/events'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...', STATIC_CACHE);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...', STATIC_CACHE);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete all old caches that don't match current version
            if (!cacheName.includes(CACHE_VERSION) || 
                (cacheName !== STATIC_CACHE && 
                 cacheName !== DYNAMIC_CACHE && 
                 cacheName !== API_CACHE)) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/static/') || 
             url.pathname.includes('.') ||
             STATIC_ASSETS.includes(url.pathname)) {
    // Static assets - Network first with cache fallback (for hashed files)
    event.respondWith(handleStaticRequest(request));
  } else {
    // HTML pages - Network first with cache fallback
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: API request failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline mode - data not available',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // For hashed files (CSS/JS), always try network first to get latest version
    if (request.url.includes('/static/css/') || request.url.includes('/static/js/')) {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          // Cache the new version
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
      } catch (error) {
        console.log('Service Worker: Network failed for static asset, trying cache:', request.url);
      }
    }
    
    // Try cache for non-hashed files or as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Static request failed:', request.url);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Page request failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    
    event.waitUntil(
      // Retry failed requests when connection is restored
      retryFailedRequests()
    );
  }
});

// Retry failed requests
async function retryFailedRequests() {
  try {
    // Get failed requests from IndexedDB or cache
    const failedRequests = await getFailedRequests();
    
    for (const failedRequest of failedRequests) {
      try {
        const response = await fetch(failedRequest);
        if (response.ok) {
          console.log('Service Worker: Successfully retried request:', failedRequest.url);
          await removeFailedRequest(failedRequest);
        }
      } catch (error) {
        console.log('Service Worker: Failed to retry request:', failedRequest.url);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error retrying failed requests:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from WINZO',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WINZO', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});

// Utility functions for failed requests (placeholder implementations)
async function getFailedRequests() {
  // Implementation would store failed requests in IndexedDB
  return [];
}

async function removeFailedRequest(request) {
  // Implementation would remove request from IndexedDB
  return Promise.resolve();
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  const startTime = performance.now();
  
  event.waitUntil(
    event.response.then((response) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow requests
      if (duration > 1000) {
        console.warn('Service Worker: Slow request detected:', {
          url: event.request.url,
          duration: `${duration.toFixed(2)}ms`
        });
      }
    })
  );
});

console.log('Service Worker: Loaded successfully'); 