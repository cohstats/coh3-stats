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
  );
