// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs");

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
  experimental: {
    // 256 kB should be OK
    largePageDataBytes: 256 * 1024,
  },
  // Localization completely changes the url and we would need to re-write the cache routes
  // In future we can look into it
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
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

// const withEdgioConfig = withEdgio({
//   ...nextConfig,
// });

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  silent: true, // Suppresses all logs
  hideSourceMaps: true,

  org: "coh-stats",
  project: "coh3-stats-web",
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
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
