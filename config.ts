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

const firebaseFunctions = {
  location: "us-east4",
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

const config = {
  getFirebaseConfig,
  isDevEnv,
  getEdgioEnvName,
  firebaseFunctions,
  DISCORD_INVITE_LINK: "https://discord.gg/jRrnwqMfkr",
  DONATION_LINK: "https://ko-fi.com/cohstats",
  GITHUB_LINK: repository.url,
  BASE_CLOUD_FUNCTIONS_URL: `https://${firebaseFunctions.location}-coh3-stats-prod.cloudfunctions.net`,
};

export default config;
