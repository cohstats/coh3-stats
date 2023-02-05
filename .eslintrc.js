module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["sonarjs", "jest"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {},
  overrides: [],
};
