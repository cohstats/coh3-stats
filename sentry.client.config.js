// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn:
    SENTRY_DSN ||
    "https://963a73a12146449490c37b42cfc1419f@o4504995920543744.ingest.sentry.io/4504995924344832",
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,
  // release: "vTestRelease",
  // release: process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME,
  environment:
    process.env.EDGIO_ENV || process.env.EDGIO_ENVIRONMENT_NAME || process.env.NODE_ENV,
  allowUrls: [/https?:\/\/((dev)\.)?coh3stats\.com/],
  ignoreErrors: [
    "TypeError: Failed to fetch",
    "The operation was aborted",
    "QuotaExceededError",
    // Random errors from Firebase
    "Installations: Could not process request. Application offline.",
    "Can't find variable: Layer0",
    "Layer0 is not defined",
    "Cannot redefine property: googletag",
    // Random NextJs loading errors
    "Loading chunk",
    // Random network errors
    "read ECONNRESET",
    "AbortError:",
    "TimeoutError:",
    "NetworkError when attempting to fetch resource.",
    "UnknownError: Connection is closing.",
  ],
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
