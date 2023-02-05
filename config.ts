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
  DiscordInviteLink: "https://discord.gg/jRrnwqMfkr",
  DonationLink: "https://ko-fi.com/cohstats",
  GitHubLink: repository.url,
};

export default config;
