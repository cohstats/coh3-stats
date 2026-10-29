import { getNewsExcerpt } from "../../../src/news/news-excerpt";

describe("getNewsExcerpt", () => {
  it("strips BBCode, images and videos", () => {
    expect(
      getNewsExcerpt(
        '[img src="{STEAM_CLAN_IMAGE}/a.png"][/img][previewyoutube=abc;full][/previewyoutube][h2]Hot Fix[/h2][p]Read the [url=https://example.com]notes[/url].[/p]',
      ),
    ).toBe("Hot Fix Read the notes .");
  });

  it("cuts long text at a word", () => {
    expect(getNewsExcerpt("one two three four", 12)).toBe("one two…");
  });

  it("returns an empty string without contents", () => {
    expect(getNewsExcerpt(undefined)).toBe("");
  });
});
