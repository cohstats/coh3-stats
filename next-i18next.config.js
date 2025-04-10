/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    locales: [
      "en",
      "fr",
      "de",
      "it",
      "ja",
      "ko",
      "pl",
      "pt-BR",
      "zh-Hans",
      "es",
      "zh-Hant",
      "tr",
      "cs",
      "ru",
    ],
    defaultLocale: "en",
    localeDetection: true,
  },
  defaultNS: "common",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath:
    typeof window === "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("path").resolve("./public/locales")
      : "/public/locales",
};
