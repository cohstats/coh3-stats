import nextI18NextConfig from "../../../next-i18next.config";
import {
  PATCH_LOCSTRING_LOCALES,
  resolvePatchLocstringLocale,
} from "../../../src/explorer/patch-locstring";

describe("resolvePatchLocstringLocale", () => {
  test("maps the app locales onto the locstring files of the data repo", () => {
    expect(resolvePatchLocstringLocale("en")).toBe("en");
    expect(resolvePatchLocstringLocale("cs")).toBe("cs");
    expect(resolvePatchLocstringLocale("pt-BR")).toBe("pt-br");
    expect(resolvePatchLocstringLocale("zh-Hans")).toBe("zh-hans");
    expect(resolvePatchLocstringLocale("zh-Hant")).toBe("zh-hant");
    expect(resolvePatchLocstringLocale("uk-UA")).toBe("uk-ua");
  });

  test("every locale the app is built with has a locstring file", () => {
    // FULL_BUILD=false builds English only, in that case there is nothing to check.
    const locales: string[] = nextI18NextConfig.i18n.locales;

    for (const locale of locales) {
      expect(PATCH_LOCSTRING_LOCALES).toContain(resolvePatchLocstringLocale(locale));
      // A locale which silently ends up on English would show English texts in the app.
      if (locale !== "en") expect(resolvePatchLocstringLocale(locale)).not.toBe("en");
    }
  });

  test("normalizes the casing and the separator", () => {
    expect(resolvePatchLocstringLocale("PT-br")).toBe("pt-br");
    expect(resolvePatchLocstringLocale("zh_Hant")).toBe("zh-hant");
  });

  test("falls back to the file of the language for an unknown region", () => {
    expect(resolvePatchLocstringLocale("en-US")).toBe("en");
    expect(resolvePatchLocstringLocale("de-AT")).toBe("de");
    // The game only ships the regional variants of these.
    expect(resolvePatchLocstringLocale("pt")).toBe("pt-br");
    expect(resolvePatchLocstringLocale("uk")).toBe("uk-ua");
    expect(resolvePatchLocstringLocale("zh")).toBe("zh-hans");
  });

  test("falls back to English for anything unknown", () => {
    expect(resolvePatchLocstringLocale("kl-GL")).toBe("en");
    expect(resolvePatchLocstringLocale("")).toBe("en");
    expect(resolvePatchLocstringLocale(null)).toBe("en");
    expect(resolvePatchLocstringLocale(undefined)).toBe("en");
  });
});
