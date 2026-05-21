/* ═══════════════════════════════════════════════
   Nachrichtenportal – Service Worker (Stale-While-Revalidate)
   Freiherr-vom-Stein Gymnasium Theme Optimized
═══════════════════════════════════════════════ */

const CACHE_NAME = 'nachrichtenportal-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/canvas-confetti/1.9.2/confetti.browser.min.js'
];

/* ── Install: Pre-cache static assets immediately ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching core static assets for custom offline access...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Caching failed for:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate: Evict old service worker caches instantly ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Cleared outdated cache structure:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch with 'Stale-While-Revalidate' Strategy ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // We do not intercept API calls, tracking URLs, or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.hostname.includes('discord.com') ||
    url.hostname.includes('ipify.org') ||
    url.hostname.includes('ip-api.com')
  ) {
    return;
  }

  // Intercept matching requests using stale-while-revalidate flow
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Prepare network request in the background
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update cache in background only if status is OK
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(err => {
            console.warn('[SW] Network fetch failed, using cached resource fallback:', err);
            // Offline fallback navigation
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html') || caches.match('/');
            }
          });

        // Instantly return the cached response if available, fetching the new representation silently
        return cachedResponse || fetchPromise;
      });
    })
  );
});
