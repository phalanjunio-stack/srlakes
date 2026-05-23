/**
 * Service Worker — cache offline-first dos assets estáticos.
 * Rede primeiro pras requisições /api e /socket.io (precisam estar fresh).
 */
const CACHE = 'srlakes-stage-sync-v4';
const ASSETS = [
  '/manifest.webmanifest',
  '/icon.svg',
  '/fonts/fonts.css',
  '/assets/logo.svg',
  '/assets/srlakes.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network-first pras APIs e socket
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"offline":true}', { headers: { 'content-type': 'application/json' } })));
    return;
  }

  // Network-first para HTML, assim redesigns aparecem logo em quem ja abriu o app.
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first pros assets
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok && e.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
