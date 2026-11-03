const VERSION = "dhu-al-jalal-v5";
const SHELL_CACHE = `${VERSION}-shell`;
const CONTENT_CACHE = `${VERSION}-content`;
const ASSET_CACHE = `${VERSION}-assets`;
const SHELL = ["/", "/offline", "/quran", "/adhkar", "/dua", "/hisn", "/library", "/manifest.webmanifest", "/icon.svg"];
const MAX_PAGES = 75;
const MAX_ASSETS = 150;

async function trimCache(cache, maximum) {
  const keys = await cache.keys();
  for (const request of keys.slice(0, Math.max(0, keys.length - maximum))) {
    await cache.delete(request);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))
  ));
  self.clients.claim();
});

function isAudio(request) {
  return request.destination === "audio" || /\.(?:mp3|m4a|ogg)(?:$|\?)/i.test(request.url);
}

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CONTENT_CACHE);
      await cache.put(request, response.clone());
      await trimCache(cache, MAX_PAGES);
      return response;
    }
    return (await caches.match(request)) || response;
  } catch {
    return (await caches.match(request)) || (await caches.match("/offline"));
  }
}

async function staticResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
    await trimCache(cache, MAX_ASSETS);
  }
  return response;
}

async function contentResponse(request) {
  const cached = await caches.match(request);
  const network = fetch(request).then(async (response) => {
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(CONTENT_CACHE);
      await cache.put(request, response.clone());
      await trimCache(cache, MAX_PAGES);
    }
    return response;
  }).catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || isAudio(request)) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/saved") || url.pathname.startsWith("/settings") || url.pathname.startsWith("/reminders")) return;
  if (request.mode === "navigate") event.respondWith(navigationResponse(request));
  else if (request.destination === "script" || request.destination === "style" || request.destination === "font" || request.destination === "image") event.respondWith(staticResponse(request));
  else event.respondWith(contentResponse(request));
});
