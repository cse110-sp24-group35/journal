/*
    This stores all paths we would like the ServiceWorker to cache when it gets installed to
    enjoy the "local first" benefit, we want to make sure once user loads first page and their internet connection
    cuts completely cut off, they would still be able to use at least 95% of the features, if not all.

    This is stored as an object for clarity purposes, the key represents the "category" and value is a list of
    links we would like ServiceWorker to actively fetch and cache.
 */
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
          // Don't use `Cache.addAll` here because when one link fails, the entire caching mechanism will fail
          // Use Promise.all so we can fetch-and-cache in parallel while preventing the issue above
          // since Promise.allSettled doesn't fail when one promise fails.
          Promise.allSettled(
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

// We would also like ServiceWorker to maintain a passive cache for any outgoing HTTP request
// ideally this would not be needed but who knows what can happen in real life lol
// better safe than sorry
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