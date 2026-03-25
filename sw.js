const CACHE_NAME = 'crypto-ai-v3';
const ASSETS = [
  '/',
  'https://mohamednasr5.github.io/ai/',
  '/manifest.json',
  'https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Cairo:wght@300;400;600;700;900&family=JetBrains+Mono:wght@300;400;500&display=swap'
];

// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network First للـ API، Cache First للملفات الثابتة
self.addEventListener('fetch', e => {
  const url = e.request.url;
  // API calls — دايماً من الشبكة
  if (url.includes('okx.com') || url.includes('pollinations') || url.includes('huggingface')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({error:'offline'}), {headers:{'Content-Type':'application/json'}})
      )
    );
    return;
  }
  // Static assets — Cache First
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});

// Push Notification (اختياري)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title:'Crypto AI', body:'إشارة جديدة!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      dir: 'rtl',
      lang: 'ar',
      vibrate: [200, 100, 200]
    })
  );
});
//
