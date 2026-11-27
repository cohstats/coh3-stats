import { IngameTip } from "../../../src/explorer/ingame-tips/ingame-tips-types";
import { TIP_CATEGORY_UNIT_GROUPS } from "../../../src/explorer/ingame-tips/ingame-tips-units";
import { WIKI_ARTICLES } from "../../../src/wiki/data";
import {
  buildWikiTipSections,
  countWikiTipsByPage,
  getWikiTipCategoryLabel,
  getWikiTipHref,
  getWikiTipPageSlug,
  WIKI_TIP_ARTICLES,
} from "../../../src/wiki/tips/wiki-tips";

const tip = (overrides: Partial<IngameTip> & Pick<IngameTip, "id">): IngameTip => ({
  pbgid: 1,
  text: `Text of ${overrides.id}`,
  category: "cover",
  topic: "combat",
  gameMode: null,
  ...overrides,
});

describe("wiki tips", () => {
  it("registers every tip page as an article of the tips category", () => {
    expect(WIKI_TIP_ARTICLES.map((article) => article.slug)).toEqual([
      "combat",
      "vehicles",
      "engineering",
      "unit-care",
      "economy",
      "visibility",
      "controls",
      "final-stand",
    ]);
    for (const article of WIKI_TIP_ARTICLES) {
      expect(article.category).toBe("tips");
      expect(WIKI_ARTICLES).toContain(article);
    }
  });

  it("puts every tip on the page of its topic", () => {
    expect(getWikiTipPageSlug({ topic: "combat", gameMode: null })).toBe("combat");
    // Only two ability tips, they are about fighting.
    expect(getWikiTipPageSlug({ topic: "abilities", gameMode: null })).toBe("combat");
    expect(getWikiTipPageSlug({ topic: "unit_care", gameMode: null })).toBe("unit-care");
    // Final Stand takes all the tips of the mode, whatever the topic.
    expect(getWikiTipPageSlug({ topic: "economy", gameMode: "hoff" })).toBe("final-stand");
    expect(getWikiTipPageSlug({ topic: "final_stand", gameMode: "hoff" })).toBe("final-stand");
    // A new topic is not dropped.
    expect(getWikiTipPageSlug({ topic: "brand_new", gameMode: null })).toBe("controls");
  });

  it("links a tip to its place in the wiki", () => {
    expect(getWikiTipHref(tip({ id: "tipcover1" }))).toBe("/wiki/tips/combat#tip-tipcover1");
    expect(getWikiTipHref(tip({ id: "hoff_tipwaves1", gameMode: "hoff" }))).toBe(
      "/wiki/tips/final-stand#tip-hoff_tipwaves1",
    );
    expect(getWikiTipHref(tip({ id: "x", gameMode: "other_mode" }))).toBeNull();
  });

  it("names the categories, also the ones without a label", () => {
    expect(getWikiTipCategoryLabel("los")).toBe("Line of Sight");
    expect(getWikiTipCategoryLabel("barbedwire")).toBe("Barbed Wire");
    expect(getWikiTipCategoryLabel("night_raids")).toBe("Night Raids");
    // Every category the unit pages know is named with spaces, not glued together like its id.
    for (const category of Object.keys(TIP_CATEGORY_UNIT_GROUPS)) {
      expect(getWikiTipCategoryLabel(category)).toMatch(/^[A-Z][\w-]*( [&\w-]+)*$/);
    }
  });

  it("splits a page into sections, biggest first, single tips at the end", () => {
    const tips = [
      tip({ id: "tipaccuracy1", category: "accuracy" }),
      tip({ id: "tipcover10" }),
      tip({ id: "tipcover2" }),
      tip({ id: "tipcover1" }),
      tip({ id: "tipaccuracy2", category: "accuracy" }),
      tip({ id: "tipfire1", category: "fire" }),
      tip({ id: "tipgrenades1", topic: "abilities", category: "grenades" }),
      tip({ id: "tiparmor1", topic: "vehicles", category: "armor" }),
      tip({ id: "hoff_x", category: "cover", gameMode: "hoff" }),
    ];

    const sections = buildWikiTipSections(tips, "combat");
    expect(sections.map(({ id, title }) => ({ id, title }))).toEqual([
      { id: "cover", title: "Cover" },
      { id: "accuracy", title: "Accuracy" },
      { id: "more-tips", title: "More Tips" },
    ]);
    // The numbering of the game, not the order of the strings.
    expect(sections[0].tips.map((t) => t.id)).toEqual(["tipcover1", "tipcover2", "tipcover10"]);
    expect(sections[2].tips.map((t) => t.id)).toEqual(["tipfire1", "tipgrenades1"]);
    // Only the id and the text go to the page props.
    expect(Object.keys(sections[0].tips[0]).sort()).toEqual(["id", "text"]);
  });

  it("keeps a lone category as a section when it is the only one on the page", () => {
    const sections = buildWikiTipSections(
      [tip({ id: "tipsmoke1", topic: "visibility", category: "smoke" })],
      "visibility",
    );
    expect(sections).toEqual([
      { id: "smoke", title: "Smoke", tips: [{ id: "tipsmoke1", text: "Text of tipsmoke1" }] },
    ]);
  });

  it("merges categories with the same name and leaves out repeated texts", () => {
    const sections = buildWikiTipSections(
      [
        tip({ id: "tipcontrols1", topic: "controls", category: "controls" }),
        tip({ id: "tipgroups1", topic: "controls", category: "groups" }),
        tip({ id: "tipcommandcard1", topic: "controls", category: "commandcard", text: "Same" }),
        tip({ id: "tipcommandcard3", topic: "controls", category: "commandcard", text: "Same " }),
        tip({ id: "tipcommandcard2", topic: "controls", category: "commandcard" }),
      ],
      "controls",
    );
    expect(sections.map((section) => [section.id, section.tips.length])).toEqual([
      ["command-groups", 2],
      ["command-card", 2],
    ]);
    // The link of the left out tip still has a target on the page.
    expect(sections[1].tips).toContainEqual({
      id: "tipcommandcard1",
      text: "Same",
      aliases: ["tipcommandcard3"],
    });
  });

  it("counts the tips of every page", () => {
    const counts = countWikiTipsByPage([
      tip({ id: "tipcover1" }),
      tip({ id: "tipcover2" }),
      tip({ id: "hoff_tipperks1", topic: "final_stand", category: "perks", gameMode: "hoff" }),
    ]);
    expect(counts).toMatchObject({ combat: 2, "final-stand": 1, vehicles: 0 });
  });
});
