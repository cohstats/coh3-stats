import { NewsItem } from "../apis/steam-api";
import localNews, { LocalNewsItem } from "./data/local-news";
import { isNewsCategory } from "./news-categories";

const extractImageFromContents = (contents?: string): string | null => {
  if (!contents) return null;

  const imgMatch = contents.match(/\[img\](.*?)\[\/img\]/)?.[1] ?? null;
  if (imgMatch) return imgMatch;

  return contents.match(/\[img src="(.*?)"\]/)?.[1] ?? null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeLocalNewsItem = (raw: LocalNewsItem): NewsItem => {
  const contents = raw.contents ?? "";
  const image = raw.image ?? extractImageFromContents(contents);
  // Missing or empty url becomes null (not undefined) so SSR/JSON stays explicit.
  const url = isNonEmptyString(raw.url) ? raw.url : null;

  return {
    gid: raw.gid,
    title: raw.title,
    author: raw.author,
    date: raw.date,
    image,
    url,
    contents,
    ...(typeof raw.imageOnly === "boolean" ? { imageOnly: raw.imageOnly } : {}),
    // Unknown categories are dropped, undefined is not serializable in SSR props.
    ...(isNewsCategory(raw.category) ? { category: raw.category } : {}),
  };
};

const getLocalNews = (): NewsItem[] => localNews.map(normalizeLocalNewsItem);

export { getLocalNews, extractImageFromContents, normalizeLocalNewsItem, type LocalNewsItem };
