// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs");

// This file was automatically added by edgio init.
// You should commit this file to source control.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withEdgio, withServiceWorker } = require("@edgio/next/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // All the images are served from the CF CDN, so we don't need to optimize them.
    unoptimized: true,
  },
};

const withEdgioConfig = withEdgio(
  withServiceWorker({
    // Output sourcemaps so that stack traces have original source filenames and line numbers when tailing
    // the logs in the Edgio developer console.
    edgioSourceMaps: true,

    // Set the following to `true` to disable the Edgio dev tools.
    disableEdgioDevTools: false,

    ...nextConfig,
  }),
);

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  release: "vTestRelease",

  silent: true, // Suppresses all logs

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(withEdgioConfig, sentryWebpackPluginOptions, {
  hideSourcemaps: true,
});
