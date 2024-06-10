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
        "scripts/database/stores/task.js",
        "scripts/database/stores/kanban.js",

        // components

        // calendar
        "scripts/components/calendar/view.js",

        // journal
        "scripts/components/journal/editor.js",
        "scripts/components/journal/modal.js",
        "scripts/components/journal/tree.js",

        // task
        "scripts/components/task/kanban.js",
        "scripts/components/task/pie-chart.js",
        "scripts/components/task/pop-up.js",
        "scripts/components/task/upcoming-tasks.js",
        "scripts/components/task/view.js",

        // layout
        "scripts/components/layout/sidebar.js"
    ],
    styles: [
        "styles/main.css",
        "styles/index.css",
        "styles/journal.css",
        "styles/main.css",
        "styles/task.css",
        "styles/task-component.css",
        "styles/upcoming-tasks.css"
    ],

    vendors: [
        "https://unpkg.com/nanostores@0.10.3/index.js",
        "https://unpkg.com/@nanostores/persistent@0.10.1/index.js",

        // Nanostores modules
        "https://unpkg.com/nanostores@0.9.5/atom/index.js",
        "https://unpkg.com/nanostores@0.9.5/clean-stores/index.js",
        "https://unpkg.com/nanostores@0.9.5/task/index.js",
        "https://unpkg.com/nanostores@0.9.5/map/index.js",
        "https://unpkg.com/nanostores@0.9.5/listen-keys/index.js",
        "https://unpkg.com/nanostores@0.9.5/lifecycle/index.js",
        "https://unpkg.com/nanostores@0.9.5/deep-map/index.js",
        "https://unpkg.com/nanostores@0.9.5/deep-map/path.js",
        "https://unpkg.com/nanostores@0.9.5/computed/index.js",
        "https://unpkg.com/nanostores@0.9.5/action/index.js",

        // Pie Chart
        "https://cdn.jsdelivr.net/npm/chart.js"
    ]
};

const CACHE_NAME = "journal-app";

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
            return cachedResponse || fetch(event.request.url).then((fetchedResponse) => {
                cache.put(event.request, fetchedResponse.clone());

                return fetchedResponse;
            });
        });
    }));
});