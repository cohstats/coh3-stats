const baseUrl = "https://api.steampowered.com/";
const COH3_STEAM_APP_ID = 1677280;

const getNumberOfOnlinePlayersSteamUrl = (appId: number | string = COH3_STEAM_APP_ID) => {
  return encodeURI(`${baseUrl}ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`);
};

export { getNumberOfOnlinePlayersSteamUrl };
