import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, setUserProperties } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getFunctions } from "firebase/functions";
import { getFirestore, Firestore } from "firebase/firestore";

import config from "../../config";

let performance;
let app: FirebaseApp | undefined;
let analytics: Analytics;
let db: Firestore | undefined;

const useEmulators = false;

/**
 * Initialize Firebase
 */
const init = (): void => {
  app = initializeApp(config.getFirebaseConfig());
  if (app.name && typeof window !== "undefined") {
    analytics = getAnalytics(app);
    performance = getPerformance(app);
    setUserProperties(analytics, { custom_platform: "web_app" });
  }

  // db = getFirestore(app);

  // if (useEmulators) {
  //     connectFirestoreEmulator(db, "localhost", 8080);
  //     connectFunctionsEmulator(functions(), "localhost", 5001);
  // }
};

/**
 * Instance of the FB functions
 */
const functions = () =>
  getFunctions(app, useEmulators ? undefined : config.firebaseFunctions.location);

const webFirebase = {
  init,
  functions,
};

export default webFirebase;
