// Bewaart de spellen op het toestel zodat ze ook offline werken.
// Met internet wordt altijd eerst de nieuwste versie opgehaald.
const CACHE = 'spelletjes';
const BASIS = ['./', 'index.html', 'spellen.json', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

async function bewaarAlles() {
  const c = await caches.open(CACHE);
  await c.addAll(BASIS);
  try {
    const lijst = await (await fetch('spellen.json', { cache: 'no-store' })).json();
    await c.addAll(lijst.flatMap(s => [s.bestand, s.plaatje].filter(Boolean)));
  } catch (e) {}
}

self.addEventListener('install', e => { e.waitUntil(bewaarAlles().then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('message', e => { if (e.data === 'bewaar') e.waitUntil(bewaarAlles()); });

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const netwerk = fetch(r, { cache: 'no-cache' }).then(res => { if (res.ok) c.put(r, res.clone()); return res; });
    const opslag = await c.match(r, { ignoreSearch: true });
    if (!opslag) return netwerk.catch(() => new Response('Dit spel is nog niet bewaard. Open het een keer met internet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
    // eerst internet proberen (max. 2,5 seconde), anders de bewaarde versie
    const wacht = new Promise(res => setTimeout(() => res(null), 2500));
    const vers = await Promise.race([netwerk.catch(() => null), wacht]);
    if (!vers) netwerk.catch(() => {});
    return vers || opslag;
  })());
});
