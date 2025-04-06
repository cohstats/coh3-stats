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
    ],
    defaultLocale: "en",
    localeDetection: true,
  },
  localePath:
    typeof window === "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("path").resolve("./public/locales")
      : "/public/locales",
};
