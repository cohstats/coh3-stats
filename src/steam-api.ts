const baseUrl = "https://api.steampowered.com/";
const coh2steamAppid = 231430;

const getNumberOfOnlinePlayersSteamUrl = (appId: number | string = coh2steamAppid) => {
  return encodeURI(`${baseUrl}ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`);
};

export { getNumberOfOnlinePlayersSteamUrl };
