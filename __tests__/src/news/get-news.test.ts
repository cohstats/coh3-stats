/**
 * @jest-environment node
 */

import { NewsItem } from "../../../src/apis/steam-api";
import { getNews, sortNewsByDateDesc } from "../../../src/news/get-news";

jest.mock("../../../src/apis/steam-api", () => ({
  getCOH3SteamNews: jest.fn(),
}));

jest.mock("../../../src/news/get-local-news", () => {
  const actual = jest.requireActual("../../../src/news/get-local-news");
  return {
    ...actual,
    getLocalNews: jest.fn(),
  };
});

import { getCOH3SteamNews } from "../../../src/apis/steam-api";
import { getLocalNews } from "../../../src/news/get-local-news";

const mockedGetCOH3SteamNews = getCOH3SteamNews as jest.MockedFunction<typeof getCOH3SteamNews>;
const mockedGetLocalNews = getLocalNews as jest.MockedFunction<typeof getLocalNews>;

describe("sortNewsByDateDesc", () => {
  it("sorts newest first", () => {
    const items: NewsItem[] = [
      { gid: "old", title: "Old", date: 100, image: null },
      { gid: "new", title: "New", date: 300, image: null },
      { gid: "mid", title: "Mid", date: 200, image: null },
    ];

    expect(sortNewsByDateDesc(items).map((i) => i.gid)).toEqual(["new", "mid", "old"]);
  });
});

describe("getNews", () => {
  beforeEach(() => {
    mockedGetCOH3SteamNews.mockReset();
    mockedGetLocalNews.mockReset();
  });

  it("merges steam and local news sorted by date desc", async () => {
    mockedGetCOH3SteamNews.mockResolvedValue({
      count: 2,
      newsitems: [
        { gid: "steam-1", title: "Steam New", date: 200, image: null },
        { gid: "steam-2", title: "Steam Old", date: 50, image: null },
      ],
    });
    mockedGetLocalNews.mockReturnValue([
      {
        gid: "local-hot",
        title: "Local Hot",
        date: 300,
        image: "/images/local.webp",
        contents: "local",
      },
      {
        gid: "local-old",
        title: "Local Old",
        date: 100,
        image: null,
        contents: "local",
      },
    ]);

    const result = await getNews();

    expect(result.newsitems.map((i) => i.gid)).toEqual([
      "local-hot",
      "steam-1",
      "local-old",
      "steam-2",
    ]);
    expect(result.count).toBe(4);
  });

  it("slices after merge so a recent local item can rank in top N", async () => {
    mockedGetCOH3SteamNews.mockResolvedValue({
      count: 3,
      newsitems: [
        { gid: "steam-1", title: "S1", date: 300, image: null },
        { gid: "steam-2", title: "S2", date: 200, image: null },
        { gid: "steam-3", title: "S3", date: 100, image: null },
      ],
    });
    mockedGetLocalNews.mockReturnValue([
      {
        gid: "local-top",
        title: "Local Top",
        date: 400,
        image: null,
        contents: "top",
      },
    ]);

    const result = await getNews(3);

    expect(result.newsitems.map((i) => i.gid)).toEqual(["local-top", "steam-1", "steam-2"]);
    expect(result.newsitems).toHaveLength(3);
    expect(result.count).toBe(4);
    expect(mockedGetCOH3SteamNews).toHaveBeenCalledWith(3);
  });
});
