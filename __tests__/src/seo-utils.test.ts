import { ReactElement } from "react";
import { TFunction } from "next-i18next/pages";
import { generateNextSeo } from "next-seo/pages";
import {
  createPageSEO,
  createPlayerSEO,
  getOpenGraphLocale,
  generateKeywordsString,
  generateLanguageAlternates,
  _defaultKeywords,
} from "../../src/seo-utils";
import { PlayerCardDataType } from "../../src/coh3/coh3-types";
import { PlayerSummaryType } from "../../src/players/utils";
import config from "../../config";
import nextI18NextConfig from "../../next-i18next.config";

// Returns the key itself, or a keywords array for `returnObjects`
const t = ((key: string, options?: { returnObjects?: boolean }) =>
  options?.returnObjects ? ["first keyword", "second keyword"] : key) as unknown as TFunction;

type HeadElement = ReactElement<Record<string, string>>;

const renderTags = (...args: Parameters<typeof generateNextSeo>) =>
  generateNextSeo(...args) as HeadElement[];

const findTags = (tags: HeadElement[], type: string, attributes: Record<string, string>) =>
  tags.filter(
    (tag) =>
      tag.type === type &&
      Object.entries(attributes).every(([name, value]) => tag.props[name] === value),
  );

describe("generateKeywordsString", () => {
  test("should return the default keywords if no keywords are passed", () => {
    const result = generateKeywordsString();
    expect(result).toBe(_defaultKeywords.join(", "));
  });

  test("should return the default keywords if an empty array is passed", () => {
    const result = generateKeywordsString([]);
    expect(result).toBe(_defaultKeywords.join(", "));
  });

  test("Should correctly contact new keywords with the default keywords", () => {
    const result = generateKeywordsString(["new", "keywords"]);
    expect(result).toBe("new, keywords, " + _defaultKeywords.join(", "));
  });
});

describe("generateLanguageAlternates", () => {
  test("should prefix every locale except the default one and add x-default", () => {
    const alternates = generateLanguageAlternates("/explorer/maps");

    expect(alternates).toContainEqual({
      hrefLang: "en",
      href: `${config.SITE_URL}/explorer/maps`,
    });
    expect(alternates[alternates.length - 1]).toEqual({
      hrefLang: "x-default",
      href: `${config.SITE_URL}/explorer/maps`,
    });
    for (const { hrefLang, href } of alternates) {
      if (hrefLang === "en" || hrefLang === "x-default") continue;
      expect(href).toBe(`${config.SITE_URL}/${hrefLang}/explorer/maps`);
    }
  });
});

describe("createPageSEO with generateNextSeo", () => {
  const tags = renderTags(createPageSEO(t, "search", "/search"));

  test("should render the title, description and canonical", () => {
    expect(findTags(tags, "title", {})[0].props.children).toBe("search:meta.title");
    expect(findTags(tags, "meta", { name: "description" })).toHaveLength(1);
    expect(findTags(tags, "link", { rel: "canonical" })[0].props.href).toBe(
      `${config.SITE_URL}/search`,
    );
  });

  test("should render one indexable robots tag", () => {
    const robots = findTags(tags, "meta", { name: "robots" });
    expect(robots).toHaveLength(1);
    expect(robots[0].props.content).toBe("index,follow");
  });

  test("should render the keywords and the language alternates", () => {
    expect(findTags(tags, "meta", { name: "keywords" })[0].props.content).toBe(
      generateKeywordsString(["first keyword", "second keyword"]),
    );
    const alternates = findTags(tags, "link", { rel: "alternate" });
    expect(alternates.map((tag) => tag.key)).toContain("languageAlternate-x-default");
    expect(alternates).toHaveLength(generateLanguageAlternates("/search").length);
  });
});

describe("sitewide defaults with generateNextSeo", () => {
  test("should apply the titleTemplate from the default SEO to the page title", () => {
    // The defaults are module state in next-seo, a fresh copy keeps the template out of the other tests
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nextSeo = require("next-seo/pages") as typeof import("next-seo/pages");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const defaultSEO = require("../../next-seo.config").default;

      // Same order as `_app`: the defaults are generated before the page tags
      nextSeo.generateDefaultSeo(defaultSEO);
      const tags = nextSeo.generateNextSeo(
        createPageSEO(t, "search", "/search"),
      ) as HeadElement[];

      expect(findTags(tags, "title", {})[0].props.children).toBe(
        "search:meta.title | COH3 Stats",
      );
      // Open Graph keeps the plain title, the template is only for <title>
      expect(findTags(tags, "meta", { property: "og:title" })[0].props.content).toBe(
        "search:meta.title",
      );
    });
  });
});

describe("getOpenGraphLocale", () => {
  test("should map the app locales to the Open Graph format", () => {
    expect(getOpenGraphLocale("en")).toBe("en_US");
    expect(getOpenGraphLocale("de")).toBe("de_DE");
    expect(getOpenGraphLocale("pt-BR")).toBe("pt_BR");
    expect(getOpenGraphLocale("uk-UA")).toBe("uk_UA");
    expect(getOpenGraphLocale("zh-Hans")).toBe("zh_CN");
    expect(getOpenGraphLocale("zh-Hant")).toBe("zh_TW");
  });

  test("should give every supported locale a language_TERRITORY value", () => {
    for (const locale of nextI18NextConfig.i18n.locales) {
      expect(getOpenGraphLocale(locale)).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });

  test("should fall back to en_US", () => {
    expect(getOpenGraphLocale(undefined)).toBe("en_US");
    expect(getOpenGraphLocale("xx")).toBe("en_US");
  });
});

describe("createPlayerSEO with generateNextSeo", () => {
  const playerData = {
    info: { relicID: 26631, name: "Thomas" },
    steamData: { steamid: "1", profileurl: "", avatarmedium: "https://avatars/thomas.jpg" },
  } as unknown as PlayerCardDataType;
  const playerSummary = { totalGames: 10, winRate: 0.5 } as unknown as PlayerSummaryType;

  test("should render a single nofollow robots tag", () => {
    const tags = renderTags(createPlayerSEO(t, playerData, playerSummary, "steam"));

    const robots = findTags(tags, "meta", { name: "robots" });
    expect(robots).toHaveLength(1);
    expect(robots[0].props.content).toBe("index,nofollow");
  });

  test("should use the Steam avatar as the Open Graph image", () => {
    const tags = renderTags(createPlayerSEO(t, playerData, playerSummary, "steam"));

    expect(findTags(tags, "meta", { property: "og:image" })[0].props.content).toBe(
      "https://avatars/thomas.jpg",
    );
    expect(findTags(tags, "meta", { property: "og:type" })[0].props.content).toBe("profile");
  });
});
