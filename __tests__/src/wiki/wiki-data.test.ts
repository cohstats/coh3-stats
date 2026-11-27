import fs from "fs";
import path from "path";
import { WIKI_ARTICLES } from "../../../src/wiki/data";
import { getWikiCategory, getWikiSeries } from "../../../src/wiki/wiki-categories";
import {
  extractHeadings,
  getReadingMinutes,
  getWikiArticle,
  getWikiArticleImage,
  getWikiArticlePatch,
  getWikiNavigation,
  getWikiNeighbours,
  getWikiSeriesInfo,
  parsePatchDataTime,
  slugifyHeading,
} from "../../../src/wiki/get-wiki";

const publicDir = path.join(__dirname, "../../../public");

describe("wiki data", () => {
  it("has unique article slugs", () => {
    const slugs = WIKI_ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(WIKI_ARTICLES.map((article) => [article.slug, article] as const))(
    "%s is valid",
    (_slug, article) => {
      expect(article.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      const category = getWikiCategory(article.category);
      expect(category).toBeDefined();
      if (article.group) {
        expect(category?.groups?.map((group) => group.id)).toContain(article.group);
      }
      if (article.series) {
        expect(getWikiSeries(article.series.id)).toBeDefined();
      }
      expect(article.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.authors.length).toBeGreaterThan(0);
      for (const author of article.authors) {
        expect(author.name.trim()).not.toBe("");
        if (author.url) expect(author.url).toMatch(/^https:\/\//);
      }
      expect(article.summary.length).toBeGreaterThan(40);
      expect(article.summary.length).toBeLessThanOrEqual(200);

      // List items must be closed, otherwise the text renders outside the bullet.
      const items = (article.contents.match(/\[\*\]/g) || []).length;
      const closed = (article.contents.match(/\[\/\*\]/g) || []).length;
      expect(closed).toBe(items);

      // The TOC links need unique heading ids.
      const ids = extractHeadings(article.contents).map((heading) => heading.id);
      expect(new Set(ids).size).toBe(ids.length);

      // Every local image exists.
      const images = Array.from(
        article.contents.matchAll(/\[(img|icon)[^\]]*\]([\s\S]*?)\[\/\1\]/g),
      ).map((match) => match[2].trim());
      for (const image of images.filter((src) => src.startsWith("/"))) {
        expect(fs.existsSync(path.join(publicDir, image))).toBe(true);
      }

      // Internal links point to existing wiki articles.
      for (const match of Array.from(
        article.contents.matchAll(/\[url=\/wiki\/([^/\]]+)\/([^\]]+)\]/g),
      )) {
        expect(getWikiArticle(match[1], match[2])).toBeDefined();
      }
    },
  );

  it("numbers series parts 1..n without gaps", () => {
    const bySeries = new Map<string, number[]>();
    for (const article of WIKI_ARTICLES) {
      if (!article.series) continue;
      bySeries.set(article.series.id, [
        ...(bySeries.get(article.series.id) ?? []),
        article.series.part,
      ]);
    }
    bySeries.forEach((parts) => {
      expect([...parts].sort((a, b) => a - b)).toEqual(parts.map((_, index) => index + 1));
    });
  });
});

describe("wiki helpers", () => {
  it("slugifies headings", () => {
    expect(slugifyHeading("Scatter offset and overshooting")).toBe(
      "scatter-offset-and-overshooting",
    );
    expect(slugifyHeading("Terrain, elevation & real fences!")).toBe(
      "terrain-elevation-and-real-fences",
    );
    expect(slugifyHeading("Catch up bonus (3.0)")).toBe("catch-up-bonus-3-0");
  });

  it("extracts h2 and h3 headings without inner tags", () => {
    expect(extractHeadings("[h2]Aim [i]time[/i][/h2] text [h3]Wind up[/h3] [h1]No[/h1]")).toEqual(
      [
        { id: "aim-time", label: "Aim time", level: 2 },
        { id: "wind-up", label: "Wind up", level: 3 },
      ],
    );
  });

  it("calculates the reading time from the text", () => {
    expect(getReadingMinutes("word ".repeat(10))).toBe(1);
    expect(getReadingMinutes(`[img]/a.webp[/img] ${"word ".repeat(1000)}`)).toBe(5);
  });

  it("uses the first image of the contents as the article image", () => {
    const article = { ...WIKI_ARTICLES[0], image: undefined, contents: "a [img]/b.webp[/img]" };
    expect(getWikiArticleImage(article)).toBe("/b.webp");
  });

  it("builds the navigation with groups in order and hides empty categories", () => {
    const navigation = getWikiNavigation();
    expect(navigation.map((category) => category.slug)).toEqual([
      "tips",
      "combat",
      "veterancy",
      "economy",
      "multiplayer",
    ]);

    // Only the tips start closed in the sidebar of the wiki home.
    expect(
      navigation.filter((category) => category.collapsed).map((category) => category.slug),
    ).toEqual(["tips"]);

    const combat = navigation.find((category) => category.slug === "combat");
    expect(combat?.groups.map((group) => group.id)).toEqual(["cover", "firing", "accuracy"]);
    expect(
      combat?.groups
        .find((group) => group.id === "firing")
        ?.articles.map((article) => article.slug),
    ).toEqual([
      "weapon-firing-cycle",
      "rate-of-fire-vs-attack-speed",
      "attack-speed-buff-examples",
    ]);

    const economy = navigation.find((category) => category.slug === "economy");
    expect(economy?.groups.map((group) => group.id)).toEqual(["territory"]);
    expect(economy?.groups[0].articles.map((article) => article.slug)).toEqual([
      "territory-capture-rates",
      "territory-capture-tactics",
      "territory-capture-micro-tips",
    ]);
  });

  it("parses the patch data times of the config", () => {
    expect(parsePatchDataTime("18/Nov/2026")).toBe("2026-11-18");
    expect(parsePatchDataTime("3/March/2024")).toBe("2024-03-03");
    expect(parsePatchDataTime("nonsense")).toBeNull();
  });

  it("picks the patch out on the updated or written day", () => {
    const patches = {
      "3.0.2": { dataTime: "18/Nov/2026" },
      "3.0.1": { dataTime: "16/Nov/2026" },
      "2.3.1": { dataTime: "01/Apr/2026" },
      "2.3.0": { dataTime: "01/Apr/2026" },
    };
    expect(getWikiArticlePatch({ date: "2026-03-14", updated: "2026-11-17" }, patches)).toBe(
      "3.0.1",
    );
    expect(getWikiArticlePatch({ date: "2026-11-18" }, patches)).toBe("3.0.2");
    expect(getWikiArticlePatch({ date: "2026-04-01" }, patches)).toBe("2.3.1");
    expect(getWikiArticlePatch({ date: "2020-01-01" }, patches)).toBeNull();
    expect(getWikiArticlePatch({ date: "2026-11-25", patch: "2.5.6" }, patches)).toBe("2.5.6");
    // Every article gets a patch from the real config.
    for (const article of WIKI_ARTICLES) {
      expect(getWikiArticlePatch(article)).not.toBeNull();
    }
  });

  it("links series parts in order", () => {
    const middle = getWikiArticle("combat", "rate-of-fire-vs-attack-speed")!;
    expect(getWikiSeriesInfo(middle)?.parts.map((part) => part.slug)).toEqual([
      "weapon-firing-cycle",
      "rate-of-fire-vs-attack-speed",
      "attack-speed-buff-examples",
    ]);
    const { previous, next } = getWikiNeighbours(middle);
    expect(previous?.slug).toBe("weapon-firing-cycle");
    expect(next?.slug).toBe("attack-speed-buff-examples");

    const first = getWikiArticle("combat", "weapon-firing-cycle")!;
    expect(getWikiNeighbours(first).previous).toBeNull();
  });
});
