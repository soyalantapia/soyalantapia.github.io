// Escaleta: funciona sin internet una vez abierta.
// Subí el número de CACHE cuando cambien los íconos o las tipografías.
var CACHE = 'escaleta-v4';
var BASE = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'guiones.json',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'fonts/barlow-condensed-600.woff2',
  'fonts/barlow-condensed-700.woff2',
  'fonts/atkinson-hyperlegible-400.woff2',
  'fonts/atkinson-hyperlegible-700.woff2'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(BASE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function guardarEnCache(req, res) {
  if (res && res.ok && res.type === 'basic') {
    var copia = res.clone();
    caches.open(CACHE).then(function (c) { return c.put(req, copia); });
  }
  return res;
}

function deCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (r) {
    if (r) return r;
    if (req.mode === 'navigate') return caches.match('./');
    return null;
  });
}

// Íconos y tipografías no cambian: primero el cache.
function primeroCache(req) {
  return caches.match(req).then(function (r) {
    return r || fetch(req).then(function (res) { return guardarEnCache(req, res); });
  });
}

// Lo demás, primero la red, para que los guiones nuevos lleguen solos.
// Si la red tarda más de 3 segundos (el wifi del estudio), contesta el cache.
function primeroRed(req) {
  return new Promise(function (resolve) {
    var listo = false;
    function dar(res) {
      if (!listo && res) { listo = true; resolve(res); }
    }
    var espera = setTimeout(function () { deCache(req).then(dar); }, 3000);
    fetch(req)
      .then(function (res) {
        clearTimeout(espera);
        guardarEnCache(req, res);
        dar(res);
      })
      .catch(function () {
        clearTimeout(espera);
        deCache(req).then(function (r) { dar(r || Response.error()); });
      });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/fonts/') >= 0 || url.pathname.indexOf('/icons/') >= 0) {
    e.respondWith(primeroCache(req));
  } else {
    e.respondWith(primeroRed(req));
  }
});
