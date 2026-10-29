import { getNewsArticleJsonLd, serializeJsonLd } from "../../../src/news/news-structured-data";
import type { NewsItem } from "../../../src/apis/steam-api";

const steamPost: NewsItem = {
  gid: "1847920302231867",
  title: "2.5.6 Hot Fix",
  author: "Hannah_RE",
  date: 1793232000,
  image: "https://clan.cloudflare.steamstatic.com/images/hotfix.png",
  url: "https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1",
  category: "patchNotes",
};

const build = (item: NewsItem) =>
  getNewsArticleJsonLd({
    item,
    url: `https://coh3stats.com/news/${item.gid}`,
    description: "Fixed an exploit.",
    image: item.image,
    section: "Patch Notes",
    newsTitle: "COH3 News",
  })["@graph"];

describe("getNewsArticleJsonLd", () => {
  it("describes a Steam post as a news article about Company of Heroes 3", () => {
    const [article, breadcrumbs] = build(steamPost) as any[];

    expect(article).toMatchObject({
      "@type": "NewsArticle",
      headline: "2.5.6 Hot Fix",
      url: "https://coh3stats.com/news/1847920302231867",
      datePublished: "2026-10-29T00:00:00.000Z",
      image: ["https://clan.cloudflare.steamstatic.com/images/hotfix.png"],
      articleSection: "Patch Notes",
      inLanguage: "en",
      author: { "@type": "Person", name: "Hannah_RE" },
      publisher: { "@type": "Organization", name: "COH3 Stats" },
      about: { "@type": "VideoGame", name: "Company of Heroes 3" },
      isBasedOn: steamPost.url,
    });
    expect(breadcrumbs.itemListElement.map((i: any) => i.item)).toEqual([
      "https://coh3stats.com",
      "https://coh3stats.com/news",
      "https://coh3stats.com/news/1847920302231867",
    ]);
  });

  it("credits a site post to its organisation, without a Steam source", () => {
    const [article] = build({
      ...steamPost,
      gid: "local-cup",
      author: "IronClad Tournaments",
      url: "https://example.com/cup",
      image: null,
    }) as any[];

    expect(article.author).toEqual({ "@type": "Organization", name: "IronClad Tournaments" });
    expect(article).not.toHaveProperty("isBasedOn");
    expect(article).not.toHaveProperty("image");
  });

  it("shortens long headlines to the 110 characters Google shows", () => {
    const [article] = build({ ...steamPost, title: "x".repeat(150) }) as any[];

    expect(article.headline).toHaveLength(110);
    expect(article.name).toHaveLength(150);
  });
});

describe("serializeJsonLd", () => {
  it("can't close the script tag", () => {
    expect(serializeJsonLd({ title: "</script><script>" })).not.toContain("</script>");
  });
});
