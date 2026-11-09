// Offline support: keeps the app itself available without signal.
// Your entries are cached separately by Firebase, so they open offline too.
// Bump CACHE when you publish changes so phones pick up the new version.
const CACHE = "akouo-v3.14.0";
// Bible books live in their own cache, kept across app updates (the BSB text doesn't change).
const BIBLE_CACHE = "akouo-bible-bsb-2022";
const SHELL = ["./","./index.html","./styles.css","./app.js","./backend.js","./themes.js","./learn.js","./journeys.js","./native.js","./bible.js","./firebase-config.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
const CACHEABLE = [self.location.origin, "https://www.gstatic.com/firebasejs/", "https://fonts.googleapis.com", "https://fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== BIBLE_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !CACHEABLE.some(p => req.url.startsWith(p))) return;
  // Bible books: from the device first; fetched and kept the first time. A "reload" request refreshes the copy.
  if (req.url.includes("/bible/bsb/")) {
    e.respondWith(caches.open(BIBLE_CACHE).then(async c => {
      const hit = req.cache === "reload" ? null : await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const res = await fetch(req.url);
      if (res.ok) await c.put(req.url, res.clone());
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || Response.error())));
    return;
  }
  // Network first for the app's own files (so updates arrive), cache as fallback when offline.
  // Cache first for fonts and the Firebase library (they never change at a given version).
  const own = req.url.startsWith(self.location.origin);
  e.respondWith(own
    ? fetch(req).then(res => { const copy = res.clone(); if (res.ok) caches.open(CACHE).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
    : caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); if (res.ok || res.type === "opaque") caches.open(CACHE).then(c => c.put(req, copy)); return res; }))
  );
});
