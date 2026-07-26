import { COH3SteamNewsType, getCOH3SteamNews, NewsItem } from "../apis/steam-api";
import { getLocalNews } from "./get-local-news";

const sortNewsByDateDesc = (items: NewsItem[]): NewsItem[] => {
  return [...items].sort((a, b) => (b.date || 0) - (a.date || 0));
};

/**
 * Loads Steam news and local site news, merges them, and sorts by date desc.
 * When `count` is set, slicing happens after the merge so local items can appear in the top N.
 */
const getNews = async (count?: number): Promise<COH3SteamNewsType> => {
  // Fetch enough Steam items so merge+slice can still fill `count` with local mix.
  // Full feed when no count (news page pagination handles its own slice).
  const steamNews = await getCOH3SteamNews(count ?? 100);
  const localNews = getLocalNews();

  const merged = sortNewsByDateDesc([...steamNews.newsitems, ...localNews]);
  const newsitems = count !== undefined ? merged.slice(0, count) : merged;

  return {
    count: merged.length,
    newsitems,
  };
};

export { getNews, sortNewsByDateDesc };
