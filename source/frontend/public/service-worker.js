// Service Worker pour Lesson Loom — cache offline-first
// Bumper CACHE_VERSION à chaque release force tous les anciens caches à
// être supprimés, ce qui garantit que les nouvelles fonctionnalités
// (ex: niveau DNL) s'affichent dès la prochaine visite.
const CACHE_VERSION = 'lesson-loom-v23-2026-06-xss-dompurify';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;
  // Skip cross-origin (CDN fonts etc.) — let browser handle
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Network-first for HTML (so updates land quickly)
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  // Stale-while-revalidate pour le JS/CSS et autres assets : on sert le cache
  // immédiatement (UX rapide), mais on rafraîchit toujours en arrière-plan
  // pour que la prochaine visite récupère la dernière version.
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
