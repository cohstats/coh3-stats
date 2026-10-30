/**
 * @jest-environment node
 */

import { getServerSideProps } from "../../pages/news";
import type { NewsItem } from "../../src/apis/steam-api";
import { getNews } from "../../src/news/get-news";

jest.mock("../../screens/news", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../src/news/get-news", () => ({ getNews: jest.fn() }));

jest.mock("next-i18next/pages/serverSideTranslations", () => ({
  serverSideTranslations: jest.fn().mockResolvedValue({}),
}));

const mockedGetNews = getNews as jest.MockedFunction<typeof getNews>;

const newsitems: NewsItem[] = [
  { gid: "patch", title: "Hot Fix", date: 400, image: null, category: "patchNotes" },
  { gid: "tournament", title: "Cup", date: 300, image: null, category: "tournaments" },
  { gid: "news", title: "Dev Diary", date: 200, image: null, category: "news" },
  { gid: "site", title: "Site update", date: 100, image: null, category: "coh3stats" },
];

const getNewsPageProps = async (query: Record<string, string>) => {
  const result = await getServerSideProps({
    res: { setHeader: jest.fn() },
    locale: "en",
    query,
  } as any);
  if (!("props" in result)) throw new Error("Expected news page props.");
  return (await result.props) as any;
};

describe("/news category filter", () => {
  beforeEach(() => {
    mockedGetNews.mockResolvedValue({ count: newsitems.length, newsitems });
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns all news without a category", async () => {
    const props = await getNewsPageProps({});

    expect(props.category).toBeNull();
    expect(props.COH3SteamNews.newsitems.map((i: NewsItem) => i.gid)).toEqual([
      "patch",
      "tournament",
      "news",
      "site",
    ]);
  });

  it("returns only the news of the selected category", async () => {
    const props = await getNewsPageProps({ category: "tournaments" });

    expect(props.category).toBe("tournaments");
    expect(props.COH3SteamNews.newsitems.map((i: NewsItem) => i.gid)).toEqual(["tournament"]);
    expect(props.COH3SteamNews.totalPages).toBe(1);
  });

  it("counts the news of every category, independent of the selected one", async () => {
    const props = await getNewsPageProps({ category: "tournaments" });

    expect(props.categoryCounts).toEqual({
      all: 4,
      patchNotes: 1,
      news: 1,
      dlcAndOffers: 0,
      communityEvents: 0,
      tournaments: 1,
      coh3stats: 1,
    });
  });

  it("ignores an unknown category", async () => {
    const props = await getNewsPageProps({ category: "majorUpdate" });

    expect(props.category).toBeNull();
    expect(props.COH3SteamNews.newsitems).toHaveLength(4);
  });
});
