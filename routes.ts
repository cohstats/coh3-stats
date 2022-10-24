// This file was automatically added by edgio deploy.
// You should commit this file to source control.
import { Router } from "@edgio/core/router";
import { nextRoutes } from "@edgio/next";

// Remove this line to suppress Next's default behavior of removing trailing slashes via a redirect.
// If trailingSlash: true is set in next.config.js, removing this line will remove the redirect that adds the trailing slash.
nextRoutes.setEnforceTrailingSlash(true);

export default new Router()
  // Prevent search engines from indexing permalink URLs
  .noIndexPermalink()
  .match("/service-worker.js", ({ serviceWorker }) => {
    return serviceWorker(".next/static/service-worker.js");
  })
  .match(
    {
      path: "/",
      headers: {
        host: "dev.coh3stats.com",
      },
    },
    ({ proxy, cache }) => {
      cache({
        edge: {
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      });
      proxy("self", { path: "/landing" });
    },
  )
  .match("/api/onlineSteamPlayers", ({ cache }) => {
    cache({
      browser: {
        maxAgeSeconds: 5 * 60, // Cache 5 minutes
      },
      edge: {
        maxAgeSeconds: 5 * 60, // Cache for 5 minutes
        staleWhileRevalidateSeconds: 3 * 60, // If we are older than 3 minutes, refresh the value
        forcePrivateCaching: true,
      },
    });
  })
  .use(nextRoutes); // automatically adds routes for all files under /pages
