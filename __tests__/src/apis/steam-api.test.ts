/**
 * @jest-environment node
 */

import { getCOH3SteamNews } from "../../../src/apis/steam-api";
import steamNewsApiResponse from "../../test-assets/steam-news-api-response.json";

describe("getCOH3SteamNews", () => {
  const setupFetchStub = (data: any) => () =>
    Promise.resolve({ json: () => Promise.resolve(data), ok: true });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(steamNewsApiResponse));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // @ts-ignore
    global.fetch.mockClear();
  });

  it("should return the news for COH3", async () => {
    const result = await getCOH3SteamNews();
    expect(result.newsitems.length).toBe(3);
    expect(result.count).toBe(94);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1677280&feeds=steam_community_announcements&count=20",
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns correct news items", async () => {
    const result = await getCOH3SteamNews();

    for (const newsItem of result.newsitems) {
      expect(newsItem).toHaveProperty("title");
      expect(typeof newsItem.title).toBe("string");

      expect(newsItem).toHaveProperty("url");
      expect(typeof newsItem.url).toBe("string");

      expect(newsItem).toHaveProperty("author");
      expect(typeof newsItem.author).toBe("string");

      expect(newsItem).toHaveProperty("contents");
      expect(typeof newsItem.contents).toBe("string");

      expect(newsItem).toHaveProperty("image");
      expect(typeof newsItem.contents).toBe("string");

      expect(newsItem).toHaveProperty("date");
      expect(typeof newsItem.date).toBe("number");

      expect(newsItem).not.toHaveProperty("feedlabel");
      expect(newsItem).not.toHaveProperty("feedname");
      expect(newsItem).not.toHaveProperty("is_external_url");
      expect(newsItem).not.toHaveProperty("feed_type");
      expect(newsItem).not.toHaveProperty("appid");
    }
  });

  it("Verify the count", async () => {
    // the fakedata Should have only 1 item in the newsitems array from steamNewsApiResponse
    const fakeData = {
      appnews: {
        appid: 1677280,
        newsitems: [
          {
            gid: "1",
            title: "Test Title",
            url: "https://testurl.com",
            is_external_url: false,
            author: "Test Author",
            contents: "Test Contents",
            feedlabel: "Test Feedlabel",
            date: 1633029600,
            feedname: "steam_community_announcements",
            feed_type: 1,
            appid: 1677280,
            tags: [],
          },
        ],
        count: 1,
      },
    };

    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeData));

    const result = await getCOH3SteamNews(1);
    expect(result.count).toBe(1);
    expect(result.newsitems.length).toBe(1);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1677280&feeds=steam_community_announcements&count=1",
    );
  });
});
