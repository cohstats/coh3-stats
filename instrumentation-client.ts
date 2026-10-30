// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { sentryDataCollection } from "./src/sentry/data-collection";

Sentry.init({
  dsn: "https://963a73a12146449490c37b42cfc1419f@o4504995920543744.ingest.us.sentry.io/4504995924344832",

  // Keep the v10 (sendDefaultPii: false) data collection behaviour
  dataCollection: sentryDataCollection,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.01,

  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: 0.01,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  allowUrls: [/https?:\/\/((dev)\.)?coh3stats\.com/],
  ignoreErrors: [
    // This is some performance issue --> we should look into
    "ResizeObserver loop completed with undelivered notifications.",
    // This error is some weird bug in NextJS - I found it online
    /Invariant: attempted to hard navigate to the same URL.+/,
    "TypeError: Failed to fetch",
    "The operation was aborted",
    "QuotaExceededError",
    // Random errors from Firebase
    "Installations: Could not process request. Application offline.",
    "Cannot redefine property: googletag",
    // Random NextJs loading errors
    "Loading chunk",
    // Random network errors
    "read ECONNRESET",
    "AbortError:",
    "TimeoutError:",
    "NetworkError when attempting to fetch resource.",
    "UnknownError: Connection is closing.",
    // Some firebase bullshit
    "FirebaseError: Installations: Firebase Installation is not registered.",
  ],
});

// Replay is lazy loaded from the Sentry CDN after the page has loaded and the browser is idle,
// so loading it and recording don't compete with page load and early interactions (INP).
const loadReplay = async () => {
  try {
    const replayIntegration = await Sentry.lazyLoadIntegration("replayIntegration");
    Sentry.addIntegration(
      replayIntegration({
        maskAllText: false,
        maskAllInputs: false,
        blockAllMedia: false,
      }),
    );
  } catch {
    // Loading from the Sentry CDN can fail (ad-blockers, offline); replays are optional.
  }
};

if (typeof window !== "undefined") {
  const scheduleReplay = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => loadReplay(), { timeout: 10000 });
    } else {
      setTimeout(loadReplay, 5000);
    }
  };

  if (document.readyState === "complete") {
    scheduleReplay();
  } else {
    window.addEventListener("load", scheduleReplay, { once: true });
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
