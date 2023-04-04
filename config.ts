import packageJson from "./package.json";
import { isBrowserEnv } from "./src/utils";
const { repository } = packageJson;

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  databaseURL: string;
  storageBucket: string;
}

const getFirebaseConfig = (): FirebaseConfig =>
  JSON.parse(process.env.NEXT_PUBLIC_APP_FIREBASE_CONFIG || "{}");

const useFirebaseEmulators = false;

const firebaseFunctions = {
  LOCATION: "us-east4",
  get EMULATORS_URL(): string {
    return `http://localhost:5001/${getFirebaseConfig().projectId}/${this.LOCATION}`;
  },
  get CLOUD_URL(): string {
    return `https://${this.LOCATION}-coh3-stats-prod.cloudfunctions.net`;
  },
};

const isDevEnv = (): boolean => {
  // Browser env
  if (isBrowserEnv()) {
    return window.location.hostname !== "coh3stats.com";
  }
  // Server env
  return process.env.EDGIO_ENVIRONMENT_NAME !== "prod";
};

const getEdgioEnvName = (): string | null => {
  return process.env.EDGIO_ENVIRONMENT_NAME || null;
};

// Latest patch needs to be a key to patches object
const latestPatch = "1.1.1";

const patches: Record<string, { dataTag: string; dataTime: string }> = {
  "1.1.1": {
    dataTag: "v1.1.1-2", // This is the tag of the data repo
    dataTime: "2/April/2023", // The date when was the data tag created (the data extracted from game)
  },
  "1.1.0": {
    dataTag: "v1.1.0-1", // This is the tag of the data repo
    dataTime: "29/March/2023", // The date when was the data tag created (the data extracted from game)
  },
  "1.0.7": {
    dataTag: "v1.0.7-4",
    dataTime: "26/March/2023",
  },
};

const getPatchDataUrl = (dataFile = "", patch = "latest") => {
  const dataTag = patch === "latest" ? patches[latestPatch].dataTag : patches[patch].dataTag;
  return `https://raw.githubusercontent.com/cohstats/coh3-data/${dataTag}/data/${dataFile}`;
};

const config = {
  getFirebaseConfig,
  isDevEnv,
  getEdgioEnvName,
  getPatchDataUrl,
  firebaseFunctions,
  useFirebaseEmulators,
  DISCORD_INVITE_LINK: "https://discord.gg/jRrnwqMfkr",
  DONATION_LINK: "https://ko-fi.com/cohstats",
  GITHUB_LINK: repository.url,
  CDN_ASSETS_HOSTING: "https://cdn.coh3stats.com",
  BASE_CLOUD_FUNCTIONS_URL: useFirebaseEmulators
    ? firebaseFunctions.EMULATORS_URL
    : firebaseFunctions.CLOUD_URL,
  patches,
  latestPatch,
};

export default config;
