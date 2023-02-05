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


/*

const firebaseConfig = {
  apiKey: "AIzaSyDjCOyT72jdUPN89yTAy8t7MD84Xj0rK6M",
  authDomain: "coh3-stats-prod.firebaseapp.com",
  projectId: "coh3-stats-prod",
  storageBucket: "coh3-stats-prod.appspot.com",
  messagingSenderId: "707348544126",
  appId: "1:707348544126:web:ab5d76f11aca66d90fb62f",
  measurementId: "G-0LSMXWVXPS"
};

 */

// const getFirebaseConfig = (): FirebaseConfig => JSON.parse(process.env.NEXT_PUBLIC_APP_FIREBASE_CONFIG || "{}");

const firebaseFunctions = {
  location: "us-east4",
};

const config = {
  // getFirebaseConfig,
  firebaseFunctions,
  DiscordInviteLink: "https://discord.gg/jRrnwqMfkr",
  DonationLink: "https://ko-fi.com/cohstats",
  GitHubLink: repository.url,
};

export default config;
