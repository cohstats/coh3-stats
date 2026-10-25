/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { NewsSection } from "../../../screens/home/news-section/news-section";
import SteamNewsPage from "../../../screens/news";
import type { NewsItem } from "../../../src/apis/steam-api";
import { getLocalNews } from "../../../src/news/get-local-news";

jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en", push: jest.fn() }),
}));

jest.mock("../../../src/firebase/analytics", () => ({
  AnalyticsNewsPageView: jest.fn(),
}));

const translateNews = ((key: string) =>
  key === "sections.news.newsLabel" ? "News" : key) as React.ComponentProps<
  typeof NewsSection
>["t"];

const renderHome = (newsitems: NewsItem[]) =>
  renderToStaticMarkup(
    <MantineProvider>
      <NewsSection steamNewsData={{ count: newsitems.length, newsitems }} t={translateNews} />
    </MantineProvider>,
  );

const getCardOpeningTag = (html: string) =>
  html.match(/<div\b[^>]*background-image:[^>]*>/)?.[0] ?? "";

const getHeadings = (html: string) =>
  Array.from(html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g), (match) => match[1]);

const getHoldTheLine = (): NewsItem => {
  const item = getLocalNews().find((news) => news.gid === "local-ironclad-hold-the-line");
  if (!item) throw new Error("HOLD THE LINE local news fixture is missing.");
  return item;
};

describe("NewsSection presentation", () => {
  it.each([undefined, false])(
    "keeps the title, News label and cover image when imageOnly is %s",
    (imageOnly) => {
      const html = renderHome([
        {
          gid: "steam-existing",
          title: "Existing Steam article",
          image: "/images/news/existing.webp",
          imageOnly,
        },
      ]);

      expect(getHeadings(html)).toContain("Existing Steam article");
      expect(html).toContain(">News</p>");
      expect(html).toContain('href="/news#steam-existing"');
      expect(getCardOpeningTag(html)).toContain("background-size:cover");
      expect(getCardOpeningTag(html)).not.toContain("background-repeat:no-repeat");
    },
  );

  it("uses the flag for any poster card rather than matching a tournament gid", () => {
    const html = renderHome([
      {
        gid: "local-another-poster",
        title: "Another poster article",
        image: "/images/news/another-poster.webp",
        imageOnly: true,
      },
    ]);

    expect(getHeadings(html)).toEqual([]);
    expect(html).not.toContain(">News</p>");
    expect(html).toContain('aria-label="Another poster article"');
    expect(html).toContain('href="/news#local-another-poster"');
    expect(getCardOpeningTag(html)).toContain("background-size:contain");
    expect(getCardOpeningTag(html)).toContain("background-position:center");
    expect(getCardOpeningTag(html)).toContain("background-repeat:no-repeat");
  });

  it("keeps the HOLD THE LINE card accessible and linked to its native news article", () => {
    const item = getHoldTheLine();
    const html = renderHome([item]);

    expect(html).toContain('href="/news#local-ironclad-hold-the-line"');
    expect(html).toContain('aria-label="' + item.title + '"');
    expect(getHeadings(html)).toEqual([]);
    expect(html).not.toContain(">News</p>");
    expect(getCardOpeningTag(html)).toContain("ironclad-hold-the-line-carousel.webp");
  });

  it("retains the image-only article title and body on the native news page", () => {
    const item = getHoldTheLine();
    const html = renderToStaticMarkup(
      <MantineProvider>
        <SteamNewsPage COH3SteamNews={{ count: 1, newsitems: [item] }} />
      </MantineProvider>,
    );

    expect(getHeadings(html)).toContain(item.title);
    expect(html).toContain('id="local-ironclad-hold-the-line"');
    expect(html).toContain("The line is forming again.");
    expect(html).toContain("/images/news/ironclad-hold-the-line.webp");
  });
});
