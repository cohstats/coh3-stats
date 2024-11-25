// import { skipWaiting, clientsClaim } from "workbox-core";
// import { precacheAndRoute } from "workbox-precaching";
// import { Prefetcher } from "@edgio/prefetch/sw";
//
// skipWaiting();
// clientsClaim();
// precacheAndRoute(self.__WB_MANIFEST || []);
//
// // Disable prefetching
// new Prefetcher().route();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.registration
    .unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach((client) => {
        if (client.url && "navigate" in client) {
          client.navigate(client.url);
        }
      });
    });
});
