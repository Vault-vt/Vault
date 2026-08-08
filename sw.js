const CACHE = "vault-v2";
const SHELL = [
  "/Vault/",
  "/Vault/index.html",
  "/Vault/manifest.json",
  "/Vault/icon.svg",
  "/Vault/apple-touch-icon.png",
  "/Vault/icon-192.png",
  "/Vault/icon-512.png",
  "/Vault/favicon-32.png"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(SHELL);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e) {
  if (e.request.method !== "GET") return;
  var url = e.request.url;
  if (url.indexOf("firestore.googleapis.com") >= 0) return;
  if (url.indexOf("identitytoolkit.googleapis.com") >= 0) return;
  if (url.indexOf("securetoken.googleapis.com") >= 0) return;
  if (url.indexOf("googleapis.com") >= 0) return;
  if (url.indexOf("gstatic.com") >= 0) return;
  if (url.indexOf("google.com/s2/favicons") >= 0) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) {
        fetch(e.request).then(function(response) {
          if (response && response.status === 200) {
            caches.open(CACHE).then(function(c) {
              c.put(e.request, response);
            });
          }
        }).catch(function() {});
        return cached;
      }
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) {
            c.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match("/Vault/index.html");
      });
    })
  );
});
