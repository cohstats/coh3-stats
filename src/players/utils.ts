import { ProcessedMatch } from "../coh3/coh3-types";

const isPlayerVictorious = (matchRecord: ProcessedMatch, profileID: string): boolean => {
  if (!matchRecord) return false;

  const playerResult = getPlayerMatchHistoryResult(matchRecord, profileID);
  return playerResult?.resulttype === 1 || false;
};

const getPlayerMatchHistoryResult = (matchRecord: ProcessedMatch, profileID: string) => {
  for (const record of matchRecord.matchhistoryreportresults) {
    if (`${record.profile_id}` === `${profileID}`) {
      return record;
    }
  }
  return null;
};

export { isPlayerVictorious, getPlayerMatchHistoryResult };
