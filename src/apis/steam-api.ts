import { logger } from "../logger";

const baseUrl = "https://api.steampowered.com/";
const COH3_STEAM_APP_ID = 1677280;

const steamImagesBaseUrl = "https://clan.cloudflare.steamstatic.com/images";

export type NewsItem = {
  gid: string;
  title: string;
  url?: string;
  author?: string;
  contents?: string;
  image: string | null;
  date?: number;
};

export type COH3SteamNewsType = {
  count: number;
  newsitems: NewsItem[];
};

const getNumberOfOnlinePlayersSteamUrl = (appId: number | string = COH3_STEAM_APP_ID) => {
  return encodeURI(`${baseUrl}ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`);
};

const getCOH3SteamNewsUrl = (count: number = 20) => {
  return encodeURI(
    `${baseUrl}ISteamNews/GetNewsForApp/v2/?appid=${COH3_STEAM_APP_ID}&feeds=steam_community_announcements&count=${count}`,
  );
};

const getCOH3SteamNews = async (count = 15): Promise<COH3SteamNewsType> => {
  try {
    const response = await fetch(getCOH3SteamNewsUrl(count));
    const { appnews } = await response.json();

    delete appnews.appid;

    appnews.newsitems = appnews.newsitems.map((news: any) => {
      delete news.is_external_url;
      delete news.feedlabel;
      delete news.feedname;
      delete news.feed_type;
      delete news.appid;

      news.contents = news.contents.replaceAll("{STEAM_CLAN_IMAGE}", steamImagesBaseUrl);
      // console.log(JSON.stringify(news.contents))
      // news.contents = news.contents.replaceAll(/\n/g, "[br]");

      // news.contents = news.contents.replaceAll(/(?:[^\]])\s*(\n{1,3})/g, "[br]");
      // news.contents = news.contents.replaceAll("][br]", "");
      // console.log(JSON.stringify(news.contents))
      news.image = news.contents.match(/\[img\](.*?)\[\/img\]/)?.[1] ?? null;

      return news;
    });

    return appnews;
  } catch (e) {
    logger.error(e);
    return { count: 0, newsitems: [] };
  }
};

export { getNumberOfOnlinePlayersSteamUrl, getCOH3SteamNews };
