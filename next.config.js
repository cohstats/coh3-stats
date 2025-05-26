// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require("./next-i18next.config");

// This file was automatically added by edgio init.
// You should commit this file to source control.
// const withEdgio = require("@edgio/next/withEdgio");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // All the images are served from the CF CDN, so we don't need to optimize them.
    // It optimized already optimized images resulting in shit quality.
    unoptimized: true,
  },
  i18n,
  experimental: {
    // 256 kB should be OK
    largePageDataBytes: 256 * 1024,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Netlify-Vary",
            value: "query",
          },
        ],
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  org: "coh-stats",
  project: "coh3-stats-web",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
};

if (process.env.ANALYZE === "true") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  // Default config
  module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
}
