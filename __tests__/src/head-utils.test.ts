import { generateKeywordsString, _defaultKeywords } from "../../src/head-utils";

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
