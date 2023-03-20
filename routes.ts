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
        maxAgeSeconds: 10,
        staleWhileRevalidateSeconds: 60,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/_next/data/:version/leaderboards.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 15,
      },
      edge: {
        // Cache for 30 seconds, revalidated after 5 seconds
        maxAgeSeconds: 10,
        staleWhileRevalidateSeconds: 60,
        forcePrivateCaching: true,
      },
    });
  })
  // Caching for players
  .match("/players(.*)", ({ cache }) => {
    cache({
      edge: {
        // Cache for 30 seconds, revalidated after 5 seconds
        maxAgeSeconds: 15,
        staleWhileRevalidateSeconds: 45,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/_next/data/:version/players/:id.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 15,
      },
      edge: {
        // Cache for 30 seconds, revalidated after 5 seconds
        maxAgeSeconds: 14,
        staleWhileRevalidateSeconds: 45,
        forcePrivateCaching: true,
      },
    });
  })
  // Caching for desktop app
  .match("/desktop-app(.*)", ({ cache }) => {
    cache({
      edge: {
        // Add 5 minutes cache
        maxAgeSeconds: 60 * 5,
        // Server stale page up to 24 hours
        staleWhileRevalidateSeconds: 24 * 60 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/_next/data/:version/desktop-app.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 60,
      },
      edge: {
        // Cache for 15 minutes
        maxAgeSeconds: 60 * 15,
        // Server stale page up to 24 hours
        staleWhileRevalidateSeconds: 24 * 60 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  .get("/assets/:path*", ({ serveStatic }) => {
    serveStatic("assets/:path*");
  })
  .use(nextRoutes); // automatically adds routes for all files under /pages
