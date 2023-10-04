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

// This controls the default patch selector in the stats page // this needs to be key statsPatchSelector object
const defaultStatsPatchSelector = "1.2.3";

// This controls the patch selector in the stats page
const statsPatchSelector: Record<
  string,
  {
    from: string;
    to: string;
    value: string;
    label: string;
    group: string;
  }
> = {
  "1.3.0": {
    from: "2023-10-04",
    to: "now",
    value: "1.3.0",
    label: "1.3.0",
    group: "Umber Wasp",
  },
  "1.2.x": {
    from: "2023-07-25",
    to: "2023-10-04",
    value: "1.2.x",
    label: "1.2.x",
    group: "Emerald Bear",
  },
  "1.2.3": {
    from: "2023-08-24",
    to: "2023-10-04",
    value: "1.2.3",
    label: "1.2.3 - 1.2.5",
    group: "Emerald Bear",
  },
  "1.2.2": {
    from: "2023-08-03",
    to: "2023-08-24",
    value: "1.2.2",
    label: "1.2.1 - 1.2.2",
    group: "Emerald Bear",
  },
  // version 1.2.1 is not significant to be in the menu
  "1.2.0": {
    from: "2023-07-25",
    to: "2023-08-03",
    value: "1.2.0",
    label: "1.2.0",
    group: "Emerald Bear",
  },
  // versions 1.1.6 not significant to be in the menu
  "1.1.5": {
    from: "2023-06-06",
    to: "2023-07-25",
    value: "1.1.5",
    label: "1.1.5",
    group: "Brass Leopard",
  },
};

// Latest patch needs to be a key to patches object
const latestPatch = "1.3.0";

// Get patchTimeSeconds here https://www.unixtimestamp.com/
const patches: Record<string, { dataTag: string; dataTime: string; patchTimeSeconds?: number }> =
  {
    "1.3.0": {
      dataTag: "v1.3.0-1", // This is the tag of the data repo
      dataTime: "04/October/2023", // The date when was the data tag created (the data extracted from game)
      patchTimeSeconds: 1696441973, // The date when the patch was released (in seconds)
    },
    "1.2.5": {
      dataTag: "v1.2.5-1", // This is the tag of the data repo
      dataTime: "31/August/2023", // The date when was the data tag created (the data extracted from game)
      patchTimeSeconds: 1693512572, // The date when the patch was released (in seconds)
    },
    "1.2.3": {
      dataTag: "v1.2.3-1", // This is the tag of the data repo
      dataTime: "28/August/2023", // The date when was the data tag created (the data extracted from game)
      patchTimeSeconds: 1692897102, // The date when the patch was released (in seconds)
    },
    "1.2.2": {
      dataTag: "v1.2.2-1", // This is the tag of the data repo
      dataTime: "03/August/2023", // The date when was the data tag created (the data extracted from game)
      patchTimeSeconds: 1691020800, // The date when the patch was released (in seconds)
    },
    "1.2.1": {
      dataTag: "v1.2.1-1", // This is the tag of the data repo
      dataTime: "28/July/2023", // The date when was the data tag created (the data extracted from game)
      patchTimeSeconds: 1690502400, // The date when the patch was released (in seconds)
    },
    "1.2.0": {
      dataTag: "v1.2.0-1", // This is the tag of the data repo
      dataTime: "25/July/2023", // The date when was the data tag created (the data extracted from game)
      patchTimeSeconds: 1690304400, // The date when the patch was released (in seconds)
    },
    "1.1.6": {
      dataTag: "v1.1.6-1", // This is the tag of the data repo
      dataTime: "12/June/2023", // The date when was the data tag created (the data extracted from game)
      patchTimeSeconds: 1686520800, // The date when the patch was released (in seconds)
    },
    "1.1.5": {
      dataTag: "v1.1.5-1", // This is the tag of the data repo
      dataTime: "09/June/2023", // The date when was the data tag created (the data extracted from game)
    },
    "1.1.4": {
      dataTag: "v1.1.4-4", // This is the tag of the data repo
      dataTime: "20/April/2023", // The date when was the data tag created (the data extracted from game)
    },
    "1.1.3": {
      dataTag: "v1.1.3-1", // This is the tag of the data repo
      dataTime: "12/April/2023", // The date when was the data tag created (the data extracted from game)
    },
    "1.1.2": {
      dataTag: "v1.1.2-1", // This is the tag of the data repo
      dataTime: "5/April/2023", // The date when was the data tag created (the data extracted from game)
    },
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
  return `https://data.coh3stats.com/cohstats/coh3-data/${dataTag}/data/${dataFile}`;
};

const config = {
  getFirebaseConfig,
  isDevEnv,
  getEdgioEnvName,
  getPatchDataUrl,
  firebaseFunctions,
  useFirebaseEmulators,
  DISCORD_INVITE_LINK: "https://discord.gg/4Bj2y84WAR",
  DONATION_LINK: "https://ko-fi.com/cohstats",
  GITHUB_LINK: repository.url,
  CDN_ASSETS_HOSTING: "https://cdn.coh3stats.com",
  BASE_CLOUD_FUNCTIONS_URL: useFirebaseEmulators
    ? firebaseFunctions.EMULATORS_URL
    : firebaseFunctions.CLOUD_URL,
  BASED_CLOUD_FUNCTIONS_PROXY_URL: useFirebaseEmulators
    ? firebaseFunctions.EMULATORS_URL
    : "https://cache.coh3stats.com",
  patches,
  latestPatch,
  statsPatchSelector,
  defaultStatsPatchSelector,
};

export default config;
