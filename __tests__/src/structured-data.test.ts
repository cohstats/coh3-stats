import {
  getBreadcrumbItems,
  getPlayerJsonLd,
  getSiteJsonLd,
  getUnitListLinks,
  getWebPageJsonLd,
} from "../../src/structured-data";
import type { SbpsType } from "../../src/unitStats";

const unit = (id: string, unitType: string, screenName: string) =>
  ({ id, unitType, ui: { screenName } }) as unknown as SbpsType;

describe("getBreadcrumbItems", () => {
  it("starts at the home page and leaves the url of the current page out", () => {
    expect(
      getBreadcrumbItems(
        [
          { name: "Explorer", path: "/explorer" },
          { name: "US Forces", path: "/explorer/races/american" },
        ],
        "Units",
        "en",
      ),
    ).toEqual([
      { name: "COH3 Stats", item: "https://coh3stats.com" },
      { name: "Explorer", item: "https://coh3stats.com/explorer" },
      { name: "US Forces", item: "https://coh3stats.com/explorer/races/american" },
      { name: "Units" },
    ]);
  });

  it("links the pages of the locale", () => {
    expect(getBreadcrumbItems([{ name: "Erkunden", path: "/explorer" }], "Waffen", "de")).toEqual(
      [
        { name: "COH3 Stats", item: "https://coh3stats.com/de" },
        { name: "Erkunden", item: "https://coh3stats.com/de/explorer" },
        { name: "Waffen" },
      ],
    );
  });
});

describe("getWebPageJsonLd", () => {
  it("describes a page about Company of Heroes 3 on the site", () => {
    const jsonLd = getWebPageJsonLd({
      path: "/explorer/weapons",
      name: "Weapons",
      description: "All the weapons in the game.",
      locale: "de",
    });

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "WebPage",
      // The url of the locale, the same page `inLanguage` describes
      "@id": "https://coh3stats.com/de/explorer/weapons",
      url: "https://coh3stats.com/de/explorer/weapons",
      name: "Weapons",
      description: "All the weapons in the game.",
      inLanguage: "de",
      isPartOf: expect.objectContaining({ "@type": "WebSite", url: "https://coh3stats.com" }),
      about: expect.objectContaining({ "@type": "VideoGame", name: "Company of Heroes 3" }),
      publisher: expect.objectContaining({ "@type": "Organization", name: "COH3 Stats" }),
    });
  });

  it("adds the main image when there is one", () => {
    const jsonLd = getWebPageJsonLd({
      path: "/explorer/maps/twin_beach",
      name: "Twin Beaches - COH3 Map",
      locale: "en",
      image: "https://cdn.coh3stats.com/twin_beach.webp",
    });

    expect(jsonLd).not.toHaveProperty("description");
    expect(jsonLd.primaryImageOfPage).toEqual({
      "@type": "ImageObject",
      url: "https://cdn.coh3stats.com/twin_beach.webp",
    });
  });

  it("turns a page with a list into a CollectionPage of the listed links", () => {
    const jsonLd = getWebPageJsonLd({
      path: "/explorer/maps",
      name: "Maps",
      locale: "en",
      items: [
        { name: "Twin Beaches", path: "/explorer/maps/twin_beach" },
        { name: "Villa Fiore", path: "/explorer/maps/villa_fiore" },
      ],
    });

    expect(jsonLd["@type"]).toBe("CollectionPage");
    expect(jsonLd.mainEntity).toEqual({
      "@type": "ItemList",
      numberOfItems: 2,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Twin Beaches",
          url: "https://coh3stats.com/explorer/maps/twin_beach",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Villa Fiore",
          url: "https://coh3stats.com/explorer/maps/villa_fiore",
        },
      ],
    });
  });

  it("stays a WebPage when the list is empty", () => {
    const jsonLd = getWebPageJsonLd({
      path: "/explorer/maps",
      name: "Maps",
      locale: "en",
      items: [],
    });

    expect(jsonLd["@type"]).toBe("WebPage");
    expect(jsonLd).not.toHaveProperty("mainEntity");
  });

  it("takes a more specific page type and main entity", () => {
    const jsonLd = getWebPageJsonLd({
      path: "/players/26631",
      name: "Thomas",
      locale: "en",
      type: "ProfilePage",
      mainEntity: { "@type": "Person", name: "Thomas" },
    });

    expect(jsonLd["@type"]).toBe("ProfilePage");
    expect(jsonLd.mainEntity).toEqual({ "@type": "Person", name: "Thomas" });
  });
});

describe("getSiteJsonLd", () => {
  it("describes the site and its publisher", () => {
    const [website, organization] = getSiteJsonLd()["@graph"];

    expect(website).toMatchObject({
      "@type": "WebSite",
      "@id": "https://coh3stats.com/#website",
      name: "COH3 Stats",
      url: "https://coh3stats.com",
      publisher: { "@type": "Organization", name: "COH3 Stats" },
    });
    expect(organization).toMatchObject({
      "@type": "Organization",
      logo: { url: expect.stringContaining("https://coh3stats.com/") },
      sameAs: expect.arrayContaining(["https://github.com/cohstats/coh3-stats"]),
    });
  });
});

describe("getPlayerJsonLd", () => {
  it("describes the player with the Steam profile and avatar when there are", () => {
    expect(
      getPlayerJsonLd({
        name: "Thomas",
        relicId: 26631,
        image: "https://avatars.steamstatic.com/thomas.jpg",
        steamProfileUrl: "https://steamcommunity.com/profiles/76561198000000000",
      }),
    ).toEqual({
      "@type": "Person",
      name: "Thomas",
      identifier: "26631",
      image: "https://avatars.steamstatic.com/thomas.jpg",
      sameAs: ["https://steamcommunity.com/profiles/76561198000000000"],
    });
    expect(getPlayerJsonLd({ name: "Thomas", relicId: 26631, image: null })).toEqual({
      "@type": "Person",
      name: "Thomas",
      identifier: "26631",
    });
  });
});

describe("getUnitListLinks", () => {
  it("lists the units in the order of the unit list page, without the unnamed and other types", () => {
    const units = [
      unit("sherman_76mm_us", "vehicles", "M4A1(76) Sherman"),
      unit("riflemen_us", "infantry", "Riflemen"),
      unit("hidden_us", "infantry", ""),
      unit("barracks_us", "buildings", "Barracks"),
      unit("mortar_81mm_us", "team_weapons", "M1 81mm Mortar Team"),
      unit("m2hb_emplacement_us", "emplacements", "M2HB Emplacement"),
    ];

    expect(getUnitListLinks(units, "american")).toEqual([
      { name: "Riflemen", path: "/explorer/races/american/units/riflemen_us" },
      { name: "M1 81mm Mortar Team", path: "/explorer/races/american/units/mortar_81mm_us" },
      { name: "M4A1(76) Sherman", path: "/explorer/races/american/units/sherman_76mm_us" },
      { name: "M2HB Emplacement", path: "/explorer/races/american/units/m2hb_emplacement_us" },
    ]);
  });
});
