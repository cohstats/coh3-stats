/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { getServerSideProps } from "../../pages/news/[id]";
import NewsArticlePage, { NewsArticlePageProps } from "../../screens/news/news-article-page";
import type { NewsItem } from "../../src/apis/steam-api";
import { getNews } from "../../src/news/get-news";

jest.mock("../../src/news/get-news", () => ({ getNews: jest.fn() }));

jest.mock("next-i18next/pages/serverSideTranslations", () => ({
  serverSideTranslations: jest.fn().mockResolvedValue({}),
}));

jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en", push: jest.fn() }),
}));

jest.mock("../../src/firebase/analytics", () => ({
  AnalyticsNewsArticleView: jest.fn(),
}));

const mockedGetNews = getNews as jest.MockedFunction<typeof getNews>;

const newsitems: NewsItem[] = [
  { gid: "patch", title: "Hot Fix", date: 400, image: null, category: "patchNotes" },
  {
    gid: "local-cup",
    title: "Cup",
    author: "IronClad Tournaments",
    date: 300,
    image: "/images/news/cup.webp",
    category: "tournaments",
    contents: "[img]/images/news/cup.webp[/img][p]Sign up for the [b]Cup[/b] now.[/p]",
  },
  { gid: "news", title: "Dev Diary", date: 200, image: null, category: "news" },
];

const getArticleProps = async (id: string) => {
  const setHeader = jest.fn();
  const result = await getServerSideProps({
    res: { setHeader },
    locale: "en",
    params: { id },
  } as any);
  return { result, setHeader };
};

const getProps = async (id: string) => {
  const { result } = await getArticleProps(id);
  if (!("props" in result)) throw new Error("Expected news article props.");
  return (await result.props) as NewsArticlePageProps;
};

describe("/news/[id]", () => {
  beforeEach(() => {
    mockedGetNews.mockResolvedValue({ count: newsitems.length, newsitems });
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the article with its newer and older neighbours", async () => {
    const props = await getProps("local-cup");

    expect(props.item.title).toBe("Cup");
    expect(props.description).toBe("Sign up for the Cup now.");
    expect(props.newerItem).toEqual({ gid: "patch", title: "Hot Fix" });
    expect(props.olderItem).toEqual({ gid: "news", title: "Dev Diary" });
  });

  it("has no newer article for the latest one and no older for the oldest", async () => {
    expect((await getProps("patch")).newerItem).toBeNull();
    expect((await getProps("news")).olderItem).toBeNull();
  });

  it("returns 404 for an unknown article without caching it", async () => {
    const { result, setHeader } = await getArticleProps("missing");

    expect(result).toEqual({ notFound: true });
    expect(setHeader).not.toHaveBeenCalled();
  });

  it("renders links back to all news and to the neighbours", async () => {
    const props = await getProps("local-cup");
    const html = renderToStaticMarkup(
      <MantineProvider>
        <NewsArticlePage {...props} />
      </MantineProvider>,
    );

    expect(html).toContain("<h1");
    expect(html).toContain("Sign up for the");
    expect(html.match(/href="\/news"/g)).toHaveLength(2);
    expect(html).toContain('href="/news/patch"');
    expect(html).toContain('href="/news/news"');
    // The category badge leads to the filtered overview.
    expect(html).toContain('href="/news?category=tournaments"');
  });
});
