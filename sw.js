const CACHE = 'almohandis-v4';
const ASSETS = [
  './',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Cairo:wght@300;400;600;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap',
  'https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('okx.com') ||
      e.request.url.includes('generativelanguage') ||
      e.request.url.includes('pollinations') ||
      e.request.url.includes('allorigins') ||
      e.request.url.includes('corsproxy') ||
      e.request.url.includes('openrouter')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
