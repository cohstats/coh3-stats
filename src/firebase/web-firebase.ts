import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, setUserProperties, logEvent } from "firebase/analytics";

import config from "../../config";

let app: FirebaseApp | undefined;
let analytics: Analytics;

/**
 * Initialize Firebase
 */
const init = (): void => {
  app = initializeApp(config.getFirebaseConfig());
  // Only initialize analytics in production environment (not on localhost or dev environments)
  // This prevents false positives in e2e tests and avoids polluting analytics with dev data
  if (app.name && typeof window !== "undefined" && !config.isDevEnv()) {
    analytics = getAnalytics(app);
    setUserProperties(analytics, { custom_platform: "web_app" });
  }
};

/**
 * Log analytics event
 * @param name name of the event in a format event_name_action
 * @param params
 */
const logFBEvent = (
  name: string,
  params?: Record<string, string | boolean | number | undefined>,
): void => {
  if (analytics) {
    logEvent(analytics, name, params);
  }
};

const webFirebase = {
  init,
  logFBEvent,
};

export default webFirebase;
