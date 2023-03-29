import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, setUserProperties } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
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
  if (app.name && typeof window !== "undefined") {
    analytics = getAnalytics(app);
    // This is OK we just need to "getPerf" to initialize it
    performance = getPerformance(app);
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

const webFirebase = {
  init,
  functions,
};

export default webFirebase;
