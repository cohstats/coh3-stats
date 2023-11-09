// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ["node_modules", "<rootDir>/"],

  // If you're using [Module Path Aliases](https://nextjs.org/docs/advanced-features/module-path-aliases),
  // you will have to add the moduleNameMapper in order for jest to resolve your absolute paths.
  // The paths have to be matching with the paths option within the compilerOptions in the tsconfig.json
  // For example:

  testPathIgnorePatterns: ["jest.setup.js", "test-assets", "jest-global-setup.js"],

  // motherfucking Jest doesn't support fetch ... I am wondering more and more if Jest is the right lib for tests
  setupFiles: ["./__tests__/jest.setup.js"],
  // this thing doesn't work
  globalSetup: "./__tests__/jest-global-setup.js",

  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: ["**/api/**/*.{ts,tsx}", "**/src/**/*.{ts,tsx}"],
  coveragePathIgnorePatterns: [
    ".edgio",
    "routes.ts",
    "src/firebase",
    "src/logger.ts",
    "src/coh3/index.ts",
    "src/coh3/coh3-building-types.ts",
    "src/coh3/coh3-data.ts",
    "src/coh3/coh3-raw-data.ts",
  ],
  collectCoverage: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
