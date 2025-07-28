/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    // By default, include all supported languages for production builds
    // Only when FULL_BUILD=false, build with English only (for faster development)
    locales:
      process.env.FULL_BUILD === "false"
        ? ["en"]
        : [
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
            "uk-UA",
          ],
    defaultLocale: "en",
    // Next is complaining when this is on true? which should be
    // the default value
    // localeDetection: true,
  },
  defaultNS: "common",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath:
    typeof window === "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("path").resolve("./public/locales")
      : "/public/locales",
};
