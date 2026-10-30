import { GetServerSideProps } from "next";
import config from "../config";
import { getNews } from "../src/news/get-news";
import { getNewsRoute } from "../src/routes";

// The build time sitemap.xml can't list news posted after the deploy, so the article
// pages get their own sitemap, generated from the same cached news as /news.

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

const toUrl = (path: string, lastmod?: number) =>
  `<url><loc>${escapeXml(`${config.SITE_URL}${path}`)}</loc>${
    lastmod ? `<lastmod>${new Date(lastmod * 1000).toISOString()}</lastmod>` : ""
  }</url>`;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { newsitems } = await getNews();

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    toUrl(getNewsRoute(), newsitems[0]?.date),
    ...newsitems.map((item) => toUrl(getNewsRoute(item.gid), item.date)),
    `</urlset>`,
  ].join("\n");

  // An empty list means Steam failed, don't keep that in the CDN.
  res.setHeader(
    "Cache-Control",
    newsitems.length > 0
      ? "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400"
      : "no-store",
  );
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.write(xml);
  res.end();

  return { props: {} };
};

const NewsSitemap = () => null;

export default NewsSitemap;
