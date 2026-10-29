/**
 * @jest-environment node
 */

import { getServerSideProps } from "../../pages/news-sitemap.xml";
import { getNews } from "../../src/news/get-news";

jest.mock("../../src/news/get-news", () => ({ getNews: jest.fn() }));

const mockedGetNews = getNews as jest.MockedFunction<typeof getNews>;

const renderSitemap = async () => {
  const res = { setHeader: jest.fn(), write: jest.fn(), end: jest.fn() };
  await getServerSideProps({ res } as any);
  return { xml: res.write.mock.calls[0][0] as string, setHeader: res.setHeader };
};

describe("/news-sitemap.xml", () => {
  it("lists the overview and every article with its date", async () => {
    mockedGetNews.mockResolvedValue({
      count: 2,
      newsitems: [
        { gid: "1847920302231867", title: "Hot Fix", date: 1793232000, image: null },
        { gid: "local-a&b", title: "Cup", date: 1793145600, image: null },
      ],
    });

    const { xml, setHeader } = await renderSitemap();

    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain(
      "<url><loc>https://coh3stats.com/news</loc><lastmod>2026-10-29T00:00:00.000Z</lastmod></url>",
    );
    expect(xml).toContain("<loc>https://coh3stats.com/news/1847920302231867</loc>");
    // The gid is URL encoded, so nothing is left to break the XML.
    expect(xml).toContain("<loc>https://coh3stats.com/news/local-a%26b</loc>");
    expect(setHeader).toHaveBeenCalledWith("Content-Type", "application/xml; charset=utf-8");
  });

  it("is not cached when there is no news", async () => {
    mockedGetNews.mockResolvedValue({ count: 0, newsitems: [] });

    const { setHeader } = await renderSitemap();

    expect(setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  });
});
