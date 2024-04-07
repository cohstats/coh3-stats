const baseUrl = "https://api.steampowered.com/";
const COH3_STEAM_APP_ID = 1677280;

const steamImagesBaseUrl = "https://clan.cloudflare.steamstatic.com/images";

export type NewsItem = {
  title: string;
  url: string;
  author: string;
  contents: string;
  image: string | null;
  date: number;
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
  const response = await fetch(getCOH3SteamNewsUrl(count));
  const { appnews } = await response.json();

  delete appnews.appid;

  appnews.newsitems = appnews.newsitems.map((news: any) => {
    delete news.gid;
    delete news.is_external_url;
    delete news.feedlabel;
    delete news.feedname;
    -delete news.feed_type;
    delete news.appid;

    news.contents = news.contents.replaceAll("{STEAM_CLAN_IMAGE}", steamImagesBaseUrl);
    // news.contents = news.contents.replace(/(\n\n)|\n/g, (match: any, p1: any) =>
    //   p1 ? "[br]" : "[br]",
    // );
    // console.log(JSON.stringify(news.contents))
    news.image = news.contents.match(/\[img\](.*?)\[\/img\]/)?.[1] ?? null;

    return news;
  });

  return appnews;
};

export { getNumberOfOnlinePlayersSteamUrl, getCOH3SteamNews };
