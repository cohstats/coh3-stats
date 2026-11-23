import { prepareWikiContents } from "../../../src/wiki/wiki-bbcode";

describe("prepareWikiContents", () => {
  it("wraps blank line separated text in paragraphs", () => {
    expect(prepareWikiContents("First line\nsame paragraph.\n\nSecond [b]one[/b].")).toBe(
      "[p]First line same paragraph.[/p]\n[p]Second [b]one[/b].[/p]",
    );
  });

  it("keeps block tags as they are", () => {
    const contents = [
      "Intro:",
      "[code]a = 1",
      "b = 2[/code]",
      "After.",
      "",
      "[h2]Title[/h2]",
      `[img alt="x"]/a.webp[/img]`,
      "[list]",
      "[*]One[/*]",
      "[/list]",
    ].join("\n");

    expect(prepareWikiContents(contents)).toBe(
      [
        "[p]Intro:[/p]",
        "[code]a = 1\nb = 2[/code]",
        "[p]After.[/p]",
        "[h2]Title[/h2]",
        `[img alt="x"]/a.webp[/img]`,
        "[list]\n[*]One[/*]\n[/list]",
      ].join("\n"),
    );
  });

  it("keeps nested blocks together", () => {
    const contents = `[note title="TL;DR"]\n[list]\n[*]a[/*]\n[/list]\n[/note]\nText`;
    expect(prepareWikiContents(contents)).toBe(
      `[note title="TL;DR"]\n[list]\n[*]a[/*]\n[/list]\n[/note]\n[p]Text[/p]`,
    );
  });
});
