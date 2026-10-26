/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { getStaticProps } from "../../pages";
import { NewsSection } from "../../screens/home/news-section/news-section";
import type { COH3SteamNewsType, NewsItem } from "../../src/apis/steam-api";
import { getNews } from "../../src/news/get-news";
import { getLocalNews } from "../../src/news/get-local-news";

jest.mock("../../screens/home", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../src/apis/coh3stats-api", () => ({
  getTwitchStreams: jest.fn().mockResolvedValue([]),
  getYouTubeVideosHttp: jest.fn().mockResolvedValue([]),
}));

jest.mock("../../src/leaderboards/top-leaderboards", () => ({
  getTop1v1LeaderBoards: jest.fn().mockResolvedValue(null),
}));

jest.mock("../../src/apis/reddit-api", () => ({
  getLatestCOH3RedditPosts: jest.fn().mockResolvedValue([]),
}));

jest.mock("../../src/news/get-news", () => ({ getNews: jest.fn() }));

jest.mock("next-i18next/pages/serverSideTranslations", () => ({
  serverSideTranslations: jest.fn().mockResolvedValue({}),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en", push: jest.fn() }),
}));

const mockedGetNews = getNews as jest.MockedFunction<typeof getNews>;

const getHomepageNews = async (newsitems: NewsItem[]): Promise<COH3SteamNewsType> => {
  mockedGetNews.mockResolvedValue({ count: newsitems.length, newsitems });
  const result = await getStaticProps({ locale: "en" });
  if (!("props" in result)) throw new Error("Expected homepage props.");
  const props = await result.props;
  return props.steamNewsData;
};

describe("homepage static news projection", () => {
  beforeEach(() => {
    mockedGetNews.mockReset();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("preserves explicit boolean flags without adding an undefined SSR key to default cards", async () => {
    const data = await getHomepageNews([
      {
        gid: "local-poster",
        title: "Poster article",
        image: "/images/news/poster.webp",
        imageOnly: true,
      },
      {
        gid: "local-standard",
        title: "Standard article",
        image: null,
        imageOnly: false,
      },
      { gid: "steam-existing", title: "Existing Steam article", image: null },
    ]);

    expect(mockedGetNews).toHaveBeenCalledWith(3);
    expect(data.newsitems[0]).toHaveProperty("imageOnly", true);
    expect(data.newsitems[1]).toHaveProperty("imageOnly", false);
    expect(data.newsitems[2]).not.toHaveProperty("imageOnly");
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });

  it("delivers the poster flag to NewsSection while retaining the normal Steam overlay", async () => {
    const holdTheLine = getLocalNews().find(
      (item) => item.gid === "local-ironclad-hold-the-line",
    );
    if (!holdTheLine) throw new Error("HOLD THE LINE local article is missing.");

    const data = await getHomepageNews([
      holdTheLine,
      {
        gid: "steam-existing",
        title: "Existing Steam article",
        image: "/images/news/existing.webp",
      },
    ]);
    const translateNews = ((key: string) =>
      key === "sections.news.newsLabel" ? "News" : key) as React.ComponentProps<
      typeof NewsSection
    >["t"];
    const html = renderToStaticMarkup(
      <MantineProvider>
        <NewsSection steamNewsData={data} t={translateNews} />
      </MantineProvider>,
    );
    const headings = Array.from(
      html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g),
      (match) => match[1],
    );

    expect(headings).toEqual(["Existing Steam article"]);
    expect(html.match(/>News<\/p>/g)).toHaveLength(1);
    expect(html).toContain('href="/news#local-ironclad-hold-the-line"');
    expect(html).toContain('aria-label="' + holdTheLine.title + '"');
  });
});
