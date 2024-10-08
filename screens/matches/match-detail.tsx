import { FactionSide, ProcessedMatch } from "../../src/coh3/coh3-types";
import { Container, Flex, Title, Text, Box } from "@mantine/core";
import { matchTypesAsObject } from "../../src/coh3/coh3-data";
import RenderMap from "../players/tabs/recent-matches-tab/matches-table/render-map";
import { getMatchPlayersByFaction } from "../../src/coh3/helpers";
import PlayerMatchesDataTable from "../../components/PlayerMatchesDataTable";

export default function Component({ matchData }: { matchData: ProcessedMatch }) {
  const matchtype_id = matchData.matchtype_id;
  const matchType =
    matchTypesAsObject[matchtype_id as number]["localizedName"] ||
    matchTypesAsObject[matchtype_id as number]["name"] ||
    "unknown";

  const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getMatchResult = (matchData: ProcessedMatch) => {
    let winner: FactionSide;
    let loser: FactionSide;
    winner = "axis";
    loser = "allies";

    for (const result of matchData.matchhistoryreportresults) {
      if (result.resulttype === 1) {
        winner = "axis";
        loser = "allies";
        break;
      } else if (result.resulttype === 0) {
        winner = "allies";
        loser = "axis";
        break;
      }
    }

    return { winner, loser };
  };

  const { winner, loser } = getMatchResult(matchData);
  const winnerPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, winner);
  const loserPlayers = getMatchPlayersByFaction(matchData.matchhistoryreportresults, loser);

  if (!winner || !loser) {
    return (
      <Container size="xl">
        <Text size="lg" mt="md">
          Match result could not be determined.
        </Text>
      </Container>
    );
  }

  const matchDuration = matchData.completiontime - matchData.startgametime;
  const matchDurationFormatted = formatDuration(matchDuration);

  return (
    <Container size="xl">
      <Flex justify="space-between" align="flex-start" mb="md">
        <Box>
          <Title order={2}>Match Detail - {matchData.mapname}</Title>
        </Box>

        <Flex gap={10}>
          <Flex direction="column" align="flex-end">
            <Text size="xs">Match Type {matchType}</Text>
            <Text size="xs">Map {matchData.mapname}</Text>
            <Text size="xs">Match Duration:{matchDurationFormatted}</Text>
          </Flex>
          <RenderMap mapName={matchData.mapname as string} renderTitle={false} />
        </Flex>
      </Flex>

      <PlayerMatchesDataTable data={winnerPlayers} isWinner={true} />
      <PlayerMatchesDataTable data={loserPlayers} isWinner={false} />
    </Container>
  );
}
