/* ============================================================================
   CyberPulseAcademy - service-worker.js

   Why this exists: studying on a commute with no signal is a real use case for
   a study platform, and offline shell support is cheap on GitHub Pages. A
   student who has visited once keeps the shell, the stylesheets, the scripts,
   the string bundle, the catalog and the last few topic pages they opened.

   Strategy, deliberately different per file class:

     app shell (HTML, CSS, JS, i18n, icons)   cache first, network updates in
                                              the background, no waiting
     data/catalog.json                        stale-while-revalidate, because
                                              it changes often and a slightly
                                              old manifest is better than none
     topic pages and exercise batches         stale-while-revalidate, so an
                                              opened batch stays openable
     everything else                          network first, cache as backup

   Cache-busting is handled in assets/js/store.js, not here: GitHub Pages
   cannot send Cache-Control headers, so the ?v=<version> query string is the
   only lever, and it changes the cache key for free.
   MIT licensed. See LICENSE.
   ========================================================================== */

'use strict';

/* Bump this string whenever the shell changes. It is the only thing that
   invalidates already-installed clients, so forgetting it means users keep the
   old shell until the browser next updates it. */
const SHELL_VERSION = '1.1.0';
const SHELL_CACHE = 'cm-shell-v' + SHELL_VERSION;
const DATA_CACHE = 'cm-data-v' + SHELL_VERSION;
const PAGE_CACHE = 'cm-pages-v' + SHELL_VERSION;

/* Everything needed to render a page with no network at all. Paths are
   relative, because the site may be served from a subfolder. */
const SHELL_ASSETS = [
  './',
  './index.html',
  './assets/css/main.css',
  './assets/css/components.css',
  './assets/css/exam.css',
  './assets/js/config.js',
  './assets/js/i18n.js',
  './assets/js/store.js',
  './assets/js/a11y.js',
  './assets/js/nav.js',
  './assets/js/identity.js',
  './assets/js/stats.js',
  './assets/js/catalog-render.js',
  './assets/js/exam-hub.js',
  './assets/js/search.js',
  './assets/js/share.js',
  './assets/js/seo.js',
  './assets/js/sw-register.js',
  './assets/i18n/en.json',
  './assets/img/logo.svg',
  './assets/img/icon-192.svg',
  './assets/img/icon-512.svg',
  './assets/img/icon-maskable.svg',
  './manifest.json',
  './data/catalog.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      /* addAll rejects the whole install if any single file 404s, which would
         leave the site with no service worker at all. Add individually and
         tolerate misses so one renamed asset cannot break offline support. */
      await Promise.all(
        SHELL_ASSETS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: 'reload' }));
          } catch (error) {
            /* Not fatal: the asset is simply not precached. */
            console.warn('[CM sw] could not precache', url);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = [SHELL_CACHE, DATA_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.indexOf('cm-') === 0 && keep.indexOf(name) === -1)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

/* Same-origin only. A cross-origin request is never cached or intercepted, so
   the worker cannot become an accidental proxy for a third party. */
function isSameOrigin(url) {
  return new URL(url, self.location.href).origin === self.location.origin;
}

function isShellRequest(url) {
  return /\/assets\/(css|js|i18n|img)\//.test(url.pathname) ||
         /\/manifest\.json$/.test(url.pathname) ||
         /\/$/.test(url.pathname);
}

function isDataRequest(url) {
  return /\/data\//.test(url.pathname);
}

function isPageRequest(url, request) {
  return request.mode === 'navigate' ||
         /\/topics\//.test(url.pathname) ||
         /\/exercises\//.test(url.pathname) ||
         /\/pages\//.test(url.pathname);
}

/* Cache first, then quietly refresh the entry for the next visit. Used for the
   shell, where a fast start matters more than perfect freshness, and the
   ?v= query string already guarantees a new key when the version changes. */
async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: false });
  if (cached) {
    fetch(request)
      .then((response) => {
        if (response && response.ok) { cache.put(request, response.clone()); }
      })
      .catch(() => { /* offline: the cached copy already won */ });
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) { cache.put(request, response.clone()); }
  return response;
}

/* Stale-while-revalidate. Return the cached copy immediately and update it in
   the background. A stale catalog is far better than no catalog. */
async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) { cache.put(request, response.clone()); }
      return response;
    })
    .catch(() => null);
  return cached || network || fetch(request);
}

/* Network first, cache as a fallback. Used for anything not classified, so the
   user gets fresh content when online. */
async function networkFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) { cache.put(request, response.clone()); }
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) { return cached; }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  /* Never interfere with anything that is not a plain same-origin GET. */
  if (request.method !== 'GET') { return; }
  if (!isSameOrigin(request.url)) { return; }

  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }

  if (isDataRequest(url)) {
    event.respondWith(staleWhileRevalidate(DATA_CACHE, request));
    return;
  }
  if (isShellRequest(url)) {
    event.respondWith(cacheFirst(SHELL_CACHE, request));
    return;
  }
  if (isPageRequest(url, request)) {
    event.respondWith(staleWhileRevalidate(PAGE_CACHE, request));
    return;
  }
  event.respondWith(networkFirst(SHELL_CACHE, request));
});

/* Let a page ask for an immediate update instead of waiting for the browser's
   own schedule, which on some platforms is once a day. */
self.addEventListener('message', (event) => {
  if (!event.data) { return; }
  if (event.data.type === 'CM_SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'CM_CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(
        names.filter((name) => name.indexOf('cm-') === 0).map((name) => caches.delete(name))
      ))
    );
  }
});
