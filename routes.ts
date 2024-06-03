// This is the config file for the web hosting and CDN
import { Router } from "@edgio/core/router";
import { nextRoutes } from "@edgio/next";

export default new Router()
  // .always(({ setOrigin }) => {
  //   setOrigin("edgio_serverless");
  // })
  .use(nextRoutes) // automatically adds routes for all files under /pages
  // Do not index dev sites
  .match(
    {
      headers: {
        host: /dev.coh3stats.com|preview.coh3stats.com/,
      },
    },
    ({ setResponseHeader }) => {
      setResponseHeader("x-robots-tag", "noindex, nofollow, noarchive, noimageindex");
    },
  )
  .match(
    {
      headers: {
        host: /^www.coh3stats.com$/,
      },
    },
    ({ setResponseHeader, setResponseCode }) => {
      // %{normalized_uri} => /path/to/resource?query=string
      setResponseHeader("location", "https://coh3stats.com%{normalized_uri}");
      setResponseCode(301);
    },
  )
  // Do not access dev / preview sites for robots
  .match(
    {
      path: "/robots.txt",
      headers: {
        host: /dev.coh3stats.com|preview.coh3stats.com/,
      },
    },
    ({ send, cache }) => {
      send("User-agent: *\nDisallow: /", 200);
      cache({
        edge: {
          maxAgeSeconds: 60 * 60 * 24,
          staleWhileRevalidateSeconds: 60 * 60 * 24 * 7,
          forcePrivateCaching: true,
        },
      });
    },
  )
  // https://developer.chrome.com/blog/private-prefetch-proxy/
  .match("/.well-known/traffic-advice", ({ send, setResponseHeader, cache }) => {
    setResponseHeader("Content-Type", "application/trafficadvice+json");
    send('[{"user_agent": "prefetch-proxy","fraction": 1.0}]', 200);
    cache({
      edge: {
        maxAgeSeconds: 60 * 60 * 24,
        staleWhileRevalidateSeconds: 60 * 60 * 24 * 7,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/.well-known/security.txt", ({ send, cache }) => {
    send("Contact: https://github.com/cohstats\nPreferred-Languages: en, cz", 200);
    cache({
      edge: {
        maxAgeSeconds: 60 * 60 * 24 * 14,
        staleWhileRevalidateSeconds: 60 * 60 * 24 * 14,
        forcePrivateCaching: true,
      },
    });
  })
  // Homepage caching
  .match("/", ({ cache }) => {
    cache({
      edge: {
        // Cache for 5 minutes, revalidate under 30 minutes
        maxAgeSeconds: 60 * 5,
        staleWhileRevalidateSeconds: 60 * 30,
        forcePrivateCaching: true,
      },
    });
  })
  // Homepage caching data
  .match("/_next/data/:version/index.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 60,
      },
      edge: {
        maxAgeSeconds: 60 * 5,
        staleWhileRevalidateSeconds: 60 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/api/onlineSteamPlayers", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 5 * 60, // Cache 5 minutes
      },
      edge: {
        // Cache for 3 minutes, if we are older than 3 minutes, revalidate, still serve cache
        maxAgeSeconds: 3 * 60,
        staleWhileRevalidateSeconds: 15 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  // Caching for leaderboards
  .match("/leaderboards(.*)", ({ cache }) => {
    cache({
      edge: {
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
  .match("/players(.*)", ({ cache, setResponseHeader }) => {
    cache({
      edge: {
        // Cache for 30 seconds, revalidated after 5 seconds
        maxAgeSeconds: 15,
        staleWhileRevalidateSeconds: 45,
        forcePrivateCaching: true,
      },
    });
    // Set nofollow for players, so the bots don't go on the leaderboards
    setResponseHeader("x-robots-tag", "nofollow");
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
  // Caching for desktop app
  .match("/news(.*)", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 60 * 30,
      },
      // The cache is setup in nextjs response
    });
  })
  .match("/_next/data/:version/news.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 60 * 30,
      },
      // The cache is setup in nextjs response
    });
  })
  // Caching for SSG - explorer
  .match("/_next/data/:version/explorer/races/(.*)", ({ cache }) => {
    cache({
      browser: {
        // Cache for 1 day in browser
        serviceWorkerSeconds: 60 * 60 * 24,
      },
      // Edge cache should be automatic for SSG pages
    });
  })
  // Caching for leaderboard stats
  .match("/stats/leaderboards(.*)", ({ cache }) => {
    cache({
      edge: {
        maxAgeSeconds: 60 * 20,
        // Server stale page up to 24 hours
        staleWhileRevalidateSeconds: 24 * 60 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/_next/data/:version/stats/leaderboards.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 60 * 20,
      },
      edge: {
        maxAgeSeconds: 60 * 20,
        // Server stale page up to 24 hours
        staleWhileRevalidateSeconds: 24 * 60 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  // Caching for player stats
  // TODO: Rewrite this to use header Cache-Control: s-maxage:, returned from the page itself
  .match("/stats/players(.*)", ({ cache }) => {
    cache({
      edge: {
        maxAgeSeconds: 1800,
        // Server stale page up to 24 hours
        staleWhileRevalidateSeconds: 24 * 60 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/_next/data/:version/stats/players.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 60 * 30,
      },
      edge: {
        maxAgeSeconds: 1800,
        // Server stale page up to 24 hours
        staleWhileRevalidateSeconds: 24 * 60 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  // Caching for search
  .match("/search(.*)", ({ cache }) => {
    cache({
      edge: {
        // Cache for 30 seconds, revalidated after 5 seconds
        maxAgeSeconds: 5 * 60,
        staleWhileRevalidateSeconds: 10 * 60,
        forcePrivateCaching: true,
      },
    });
  })
  .match("/_next/data/:version/search.json", ({ cache }) => {
    cache({
      browser: {
        serviceWorkerSeconds: 60,
      },
      edge: {
        // Cache for 30 seconds, revalidated after 5 seconds
        maxAgeSeconds: 5 * 60,
        staleWhileRevalidateSeconds: 10 * 60,
        forcePrivateCaching: true,
      },
    });
  });
