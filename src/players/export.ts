import { leaderBoardType, PlayerCardDataType, raceType } from "../coh3/coh3-types";

const generateCSVObject = (
  playerInfo: PlayerCardDataType,
  profileID: string,
  types = ["1v1", "2v2", "3v3", "4v4"],
) => {
  const standingsObject: any = {};

  for (const race of ["german", "american", "dak", "british"]) {
    for (const type of types) {
      const standing = playerInfo.standings[race as raceType][type as leaderBoardType];

      standingsObject[`${race}_${type}_rank`] = standing?.rank || null;
      standingsObject[`${race}_${type}_elo`] = standing?.rating || null;
      standingsObject[`${race}_${type}_total`] = standing
        ? standing.wins + standing.losses
        : null;
    }
  }

  // We do this because of the order of the keys on the object
  const playerInfoAsObject: any = {
    alias: playerInfo.info.name,
    relic_id: profileID,
    steam_id: playerInfo.steamData.steamid,
  };

  for (const type of types) {
    playerInfoAsObject[`${type}_axis_elo`] = Math.max(
      standingsObject[`german_${type}_elo`],
      standingsObject[`dak_${type}_elo`],
    );
    playerInfoAsObject[`${type}_allies_elo`] = Math.max(
      standingsObject[`american_${type}_elo`],
      standingsObject[`british_${type}_elo`],
    );
  }

  return {
    ...playerInfoAsObject,
    ...standingsObject,
  };
};

export { generateCSVObject };
