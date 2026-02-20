import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, setUserProperties, logEvent } from "firebase/analytics";
// import { getPerformance } from "firebase/performance";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";

import config from "../../config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let performance;
let app: FirebaseApp | undefined;
let analytics: Analytics;
let db: Firestore | undefined;

/**
 * Initialize Firebase
 */
const init = (): void => {
  app = initializeApp(config.getFirebaseConfig());
  // Only initialize analytics in production environment (not on localhost or dev environments)
  // This prevents false positives in e2e tests and avoids polluting analytics with dev data
  if (app.name && typeof window !== "undefined" && !config.isDevEnv()) {
    analytics = getAnalytics(app);
    // Disable firebase performance, it's reporting shit values
    // performance = getPerformance(app);
    setUserProperties(analytics, { custom_platform: "web_app" });
  }

  if (config.useFirebaseEmulators) {
    db = getFirestore(app);
    connectFirestoreEmulator(db, "localhost", 8080);
    connectFunctionsEmulator(functions(), "localhost", 5001);
  }
};

/**
 * Instance of the FB functions
 */
const functions = () =>
  getFunctions(app, config.useFirebaseEmulators ? undefined : config.firebaseFunctions.LOCATION);

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
  functions,
  logFBEvent,
};

export default webFirebase;
