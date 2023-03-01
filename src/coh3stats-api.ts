import config from "../config";


const getPlayerCardInfoUrl = (playerID: string | number) => {
  return encodeURI(
    `${config.BASE_CLOUD_FUNCTIONS_URL}/getPlayerCardInfoHttp?relicId=${playerID}`
  );
};





export {
  getPlayerCardInfoUrl
}
