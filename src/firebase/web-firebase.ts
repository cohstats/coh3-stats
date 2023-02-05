import { initializeApp, FirebaseApp } from "firebase/app";
import {getAnalytics, Analytics, setUserProperties} from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getFunctions } from "firebase/functions";
import config from "../../config";


let performance;
let app: FirebaseApp | undefined;
let analytics: Analytics;

const useEmulators = false;


/**
 * Initialize Firebase
 */
const init = (): void => {
    console.log("ENV", process.env.NEXT_PUBLIC_APP_FIREBASE_CONFIG)

    debugger
    // @ts-ignore
    app = initializeApp(process.env.NEXT_PUBLIC_APP_FIREBASE_CONFIG);
    analytics = getAnalytics(app);
    performance = getPerformance(app);
    //db = getFirestore(app);

    setUserProperties(analytics, { custom_platform: "web_app" });

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

export default {
    init,
    functions
}