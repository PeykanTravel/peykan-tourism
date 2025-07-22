const CACHE_NAME = 'peykan-tourism-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/fa',
  '/en',
  '/images/logo.png',
  '/images/badge.png',
];

const API_CACHE_PATTERNS = [
  /\/api\/v1\/tours/,
  /\/api\/v1\/events/,
  /\/api\/v1\/transfers/,
  /\/api\/v1\/shared\/currency/,
  /\/api\/v1\/shared\/language/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(error => {
              console.log(`⚠️ Failed to cache ${asset}:`, error.message);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
});

async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      console.log('📡 API response cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network failed, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'شما در حالت آفلاین هستید. لطفاً اتصال اینترنت خود را بررسی کنید.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // Try cache first for static assets
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Static asset from cache:', request.url);
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      console.log('📡 Static asset cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Static asset failed:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

async function handleNavigation(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      console.log('📡 Navigation cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Navigation failed, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📦 Navigation from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline page
    return cache.match('/offline.html') || new Response(
      `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>آفلاین - Peykan Tourism</title>
        <style>
          body { font-family: 'Vazirmatn', sans-serif; text-align: center; padding: 2rem; }
          .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
          .retry-btn { background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="offline-icon">📡</div>
        <h1>شما در حالت آفلاین هستید</h1>
        <p>لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.</p>
        <button class="retry-btn" onclick="window.location.reload()">تلاش مجدد</button>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

function isStaticAsset(pathname) {
  return STATIC_ASSETS.some(asset => pathname.includes(asset)) ||
         pathname.includes('/static/') ||
         pathname.includes('/images/') ||
         pathname.includes('/fonts/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await performAction(action);
        await removePendingAction(action.id);
        console.log('✅ Background sync completed for action:', action.id);
      } catch (error) {
        console.error('❌ Background sync failed for action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'پیام جدید دریافت شد',
    icon: '/images/logo.png',
    badge: '/images/badge.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'مشاهده',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'بستن',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Peykan Tourism', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for IndexedDB
async function getPendingActions() {
  // Implementation for getting pending actions from IndexedDB
  return [];
}

async function performAction(action) {
  // Implementation for performing the action
  return fetch(action.url, action.options);
}

async function removePendingAction(id) {
  // Implementation for removing completed action from IndexedDB
}

console.log('🔧 Service Worker script loaded'); 