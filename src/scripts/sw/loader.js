window.addEventListener("DOMContentLoaded", init);

async function init() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("./worker.js", {
                scope: "/",
            });

            if (registration.active) {
                console.log("ServiceWorker has been registered");
            }
        } catch (e) {
            console.error(`Registration failed with ${e}`);
        }
    });
}