import packageJson from "./package.json";
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

const config = {
  getFirebaseConfig,
  firebaseFunctions,
  DISCORD_INVITE_LINK: "https://discord.gg/jRrnwqMfkr",
  DONATION_LINK: "https://ko-fi.com/cohstats",
  GITHUB_LINK: repository.url,
  BASE_CLOUD_FUNCTIONS_URL: `https://${firebaseFunctions.location}-coh3-stats-prod.cloudfunctions.net`,
};

export default config;
