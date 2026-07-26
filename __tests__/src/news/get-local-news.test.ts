/**
 * @jest-environment node
 */

import {
  extractImageFromContents,
  getLocalNews,
  normalizeLocalNewsItem,
} from "../../../src/news/get-local-news";

describe("extractImageFromContents", () => {
  it("extracts classic [img] tags", () => {
    expect(extractImageFromContents("[img]/images/test.webp[/img]\nBody")).toBe(
      "/images/test.webp",
    );
  });

  it("extracts src attribute img tags", () => {
    expect(extractImageFromContents('[img src="/images/test.webp"][/img]')).toBe(
      "/images/test.webp",
    );
  });

  it("returns null when no image", () => {
    expect(extractImageFromContents("no image here")).toBeNull();
  });
});

describe("normalizeLocalNewsItem", () => {
  it("sets url to null when missing or empty", () => {
    expect(
      normalizeLocalNewsItem({
        gid: "local-a",
        title: "A",
        date: 100,
      }).url,
    ).toBeNull();

    expect(
      normalizeLocalNewsItem({
        gid: "local-a",
        title: "A",
        date: 100,
        url: null,
      }).url,
    ).toBeNull();

    expect(
      normalizeLocalNewsItem({
        gid: "local-a",
        title: "A",
        date: 100,
        url: "   ",
      }).url,
    ).toBeNull();
  });

  it("keeps a non-empty url string", () => {
    expect(
      normalizeLocalNewsItem({
        gid: "local-a",
        title: "A",
        date: 100,
        url: "https://example.com/news",
      }).url,
    ).toBe("https://example.com/news");
  });

  it("keeps explicit image and sets null url to null", () => {
    const item = normalizeLocalNewsItem({
      gid: "local-a",
      title: "A",
      date: 100,
      image: "/images/explicit.webp",
      url: null,
      contents: "[img]/images/from-body.webp[/img]",
    });

    expect(item.image).toBe("/images/explicit.webp");
    expect(item.url).toBeNull();
  });

  it("extracts image from contents when image is missing", () => {
    const item = normalizeLocalNewsItem({
      gid: "local-b",
      title: "B",
      date: 100,
      contents: "[img]/images/from-body.webp[/img]",
    });

    expect(item.image).toBe("/images/from-body.webp");
    expect(item.url).toBeNull();
  });
});

describe("getLocalNews", () => {
  it("loads local news from the typed data module", () => {
    const items = getLocalNews();

    expect(items.length).toBeGreaterThan(0);

    const ladderTournament = items.find(
      (item) => item.gid === "local-announce-ladder-tournament",
    );
    expect(ladderTournament).toBeDefined();
    expect(ladderTournament?.title).toBe("New Ladder Tournament Project for COH3");
    expect(ladderTournament?.author).toBe("Ladder Tournament");
    expect(ladderTournament?.date).toBe(1785071282);
    expect(ladderTournament?.image).toBe("/images/news/ladder-tournament.webp");
    expect(ladderTournament?.url).toBe("https://laddertournament.com.br/");
    expect(ladderTournament?.contents).toContain("Ladder Tournament");
  });

  it("prefixes local gids to avoid Steam collisions", () => {
    const items = getLocalNews();
    for (const item of items) {
      expect(item.gid.startsWith("local-")).toBe(true);
    }
  });

  it("sets url to null or string on all loaded items (never undefined)", () => {
    const items = getLocalNews();
    for (const item of items) {
      expect(item.url === null || typeof item.url === "string").toBe(true);
      expect(item.url).not.toBeUndefined();
    }
  });
});
