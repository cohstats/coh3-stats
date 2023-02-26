// This is the config file for the web hosting and CDN
import { Router } from "@edgio/core/router";
import { nextRoutes } from "@edgio/next";

// Remove this line to suppress Next's default behavior of removing trailing slashes via a redirect.
// If trailingSlash: true is set in next.config.js, removing this line will remove the redirect that adds the trailing slash.
nextRoutes.setEnforceTrailingSlash(true);

export default new Router()
  .match("/service-worker.js", ({ serviceWorker }) => {
    return serviceWorker(".next/static/service-worker.js");
  })
  .match(
    {
      path: "/",
      headers: {
        host: "coh3stats.com",
      },
    },
    ({ renderWithApp, cache }) => {
      cache({
        edge: {
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      });
      renderWithApp({ path: "/landing" });
    },
  )
  .match("/api/onlineSteamPlayers", ({ cache }) => {
    cache({
      browser: {
        maxAgeSeconds: 5 * 60, // Cache 5 minutes
      },
      edge: {
        // Cache for 3 minutes, if we are older than 3 minutes, revalidate, still serve cache
        maxAgeSeconds: 3 * 60,
        staleWhileRevalidateSeconds: 10 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  // Caching for leaderboards
  .match("/leaderboards(.*)", ({ cache }) => {
    cache({
      edge: {
        // Cache for 30 seconds, revalidated after 5 seconds
        maxAgeSeconds: 5,
        staleWhileRevalidateSeconds: 30,
        forcePrivateCaching: true,
      },
    });
  })
  .use(nextRoutes); // automatically adds routes for all files under /pages
