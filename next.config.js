// This file was automatically added by edgio init.
// You should commit this file to source control.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withEdgio, withServiceWorker } = require("@edgio/next/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    // EDGIO_ENVIRONMENT_NAME is added at the deploy & build step
    NEXT_PUBLIC_EDGIO_ENVIRONMENT_NAME: process.env.EDGIO_ENVIRONMENT_NAME,
  },
};

const _preEdgioExport = nextConfig;

module.exports = (phase, config) =>
  withEdgio(
    withServiceWorker({
      // Output sourcemaps so that stack traces have original source filenames and line numbers when tailing
      // the logs in the Edgio developer console.
      edgioSourceMaps: true,

      // Set the following to `true` to disable the Edgio dev tools.
      disableEdgioDevTools: false,

      ..._preEdgioExport,
    }),
  );
