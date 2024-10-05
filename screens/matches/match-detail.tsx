import { ProcessedMatch } from "../../src/coh3/coh3-types";
import { IconBulb } from "@tabler/icons-react";
import { Container, Flex, Group, Title, Text } from "@mantine/core";
import { matchTypesAsObject } from "../../src/coh3/coh3-data";
import RenderMap from "../players/tabs/recent-matches-tab/matches-table/render-map";

const MatchDetail = ({ matchData }: { matchData: ProcessedMatch }) => {
  const matchtype_id = matchData.matchtype_id;
  const matchType =
    matchTypesAsObject[matchtype_id as number]["localizedName"] ||
    matchTypesAsObject[matchtype_id as number]["name"] ||
    "unknown";

  // Function to format match duration into HH:MM:SS
  const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const matchDuration = matchData.completiontime - matchData.startgametime;
  const matchDurationFormatted = formatDuration(matchDuration);

  return (
    <Container>
      <Flex justify="space-between" align="center" direction="row">
        {/* Left section - match details */}
        <Flex direction="column">
          <Title order={2}>Match Detail - {matchData.mapname}</Title>
          <Group align="center" mt="xs">
            <IconBulb size={20} />
            <Text size="sm">
              Click on the row to show players' Commanders and Bulletins in this match
            </Text>
          </Group>
        </Flex>

        {/* Right section - Match stats */}

        <Flex direction="row">
          <Flex direction="column" align="flex-start" ml="lg" mr="sm">
            <Text size="sm">
              <strong>Match Type:</strong> {matchType}
            </Text>
            <Text size="sm">
              <strong>Map:</strong> {matchData.mapname}
            </Text>
            <Text size="sm">
              <strong>Match Duration:</strong> {matchDurationFormatted}
            </Text>
          </Flex>
          <RenderMap mapName={matchData.mapname as string} renderTitle={false} />
        </Flex>
      </Flex>
    </Container>
  );
};

export default MatchDetail;
