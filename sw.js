// Cambia este número cada vez que subas una versión nueva de la app
const VERSION = 'presupuesto-v5';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la red (para recibir actualizaciones); si no hay conexión, la copia guardada
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Siempre se pregunta al servidor si hay versión nueva (sin esperar a que caduque la copia del navegador)
  const mismoSitio = new URL(e.request.url).origin === self.location.origin;
  const peticion = mismoSitio ? new Request(e.request.url, {cache: 'no-cache', credentials: 'same-origin'}) : e.request;
  e.respondWith(
    fetch(peticion)
      .then(r => {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
