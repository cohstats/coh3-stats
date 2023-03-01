import { logger } from "../../src/logger";
import {getPlayerCardInfoUrl} from "../../src/coh3stats-api";
import {processPlayerInfoAPIResponse} from "../../src/players/standings";
import {leaderBoardType, PlayerCardDataType, raceType} from "../../src/coh3/coh3-types";
import { json2csvAsync } from 'json-2-csv';



const getPlayerCardInfo = async (profileID: string)  => {
  const PlayerCardRes = await fetch(getPlayerCardInfoUrl(profileID))
  return await PlayerCardRes.json()
}

const getPlayerInfo = async (profileID: string): Promise<PlayerCardDataType> => {
  return processPlayerInfoAPIResponse(await getPlayerCardInfo(profileID))
}

const generateCSVObject = (playerInfo: PlayerCardDataType, profileID: string) => {

  const playerInfoAsObject: any = {
    alias: playerInfo.info.name,
    relic_id: profileID,
    steam_id: playerInfo.steamData.steamid
  }

  for(const race of ["german" , "american" , "dak" , "british"]){
    for(const type of ["1v1" , "2v2", "3v3", "4v4"]){
      const standing = playerInfo.standings[race as raceType][type as leaderBoardType];

        playerInfoAsObject[`${race}_${type}_rank`] = standing?.rank || null
        playerInfoAsObject[`${race}_${type}_elo`] = standing?.rating || null
        playerInfoAsObject[`${race}_${type}_total`] = standing ? (standing?.wins + standing?.losses) : null


    }
  }

  return playerInfoAsObject
}

export default async function handler(req: any, res: any) {
  try {
    const query = req.query;
    const {profileIDs} = query;

    if(!profileIDs){
      throw new Error("Invalid params")
    }

    const arrayOfIds = JSON.parse(profileIDs)
    logger.log(`Going to parse ${arrayOfIds.length} ids`)
    logger.log(`List of IDs ${arrayOfIds}`)
    if(arrayOfIds.length > 100){
      throw new Error("Invalid params")
    }

    const finalArray = [];

    for(const profileId of arrayOfIds){
      const playerInfo = await getPlayerInfo(profileId);
      const playerInfoAsCSVObject = generateCSVObject(playerInfo, profileId);
      finalArray.push(playerInfoAsCSVObject);
    }

    res
      .status(200)
      .setHeader('content-type', 'text/csv')
      .send(await json2csvAsync(finalArray, {  }));
  } catch (e) {
    logger.error(e);
    res.status(500).json();
  }
}
