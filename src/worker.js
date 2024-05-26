const CACHE_DERIVES = {
    html: [
        "index.html",
        "calendar.html",
        "journal.html",
        "tasks.html",
        "./",
        "calendar",
        "journal",
        "tasks"
    ],
    scripts: [
        "scripts/database/stores/journal.js",
        "scripts/database/stores/relation.js",
        "scripts/database/stores/task.js"
    ],
    styles: [
        "styles/main.css"
    ],

    vendors: [
        "https://unpkg.com/nanostores@0.10.3/index.js",
        "https://unpkg.com/@nanostores/persistent@0.10.1/index.js"
    ]
};

const CACHE_NAME = "journal";

self.addEventListener("install", event => {
   event.waitUntil(
       caches.open(CACHE_NAME).then(cache => {
          Promise.all(
              Object.values(CACHE_DERIVES).flat().map(link => cache.add(link))
          ).catch(reason => {
              console.warn(`Failed to cache`, reason);
          });
       })
   )
});

self.addEventListener("activate", event => {
   event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    event.respondWith(caches.open(CACHE_NAME).then((cache) => {
        // Respond with the image from the cache or from the network
        return cache.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request.url, {
                mode: "no-cors"
            }).then((fetchedResponse) => {
                cache.put(event.request, fetchedResponse.clone());

                return fetchedResponse;
            });
        });
    }));
});