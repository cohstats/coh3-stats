module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  // plugins: ["sonarjs", "jest"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    // We shouldn't really use ANY but we can't have everything perfect
    "@typescript-eslint/no-explicit-any": "off",
    // We kinda need interface not type
    "@typescript-eslint/no-empty-interface": "off",
    // Disable ts ignore
    "@typescript-eslint/ban-ts-comment": "off",
  },
  overrides: [],
};
