import { leaderBoardType, raceType, RawLeaderboardStat } from "../../../src/coh3/coh3-types";
import PlayerStandingsTable from "./player-standings-table";
import React from "react";
import { Group, Space, Title } from "@mantine/core";
import FactionIcon from "../../faction-icon";
import { localizedNames } from "../../../src/coh3/coh3-data";
import PlayerStandingsFactionInfo from "./faction-summary";

const PlayerStandingsFaction = ({
  faction,
  data,
}: {
  faction: raceType;
  data: Record<leaderBoardType, RawLeaderboardStat | null>;
}) => {
  return (
    <>
      <Group>
        <FactionIcon name={faction} width={35} />{" "}
        <Title order={2}>{localizedNames[faction]}</Title>
      </Group>
      <Space h="xs" />
      <Group>
        <PlayerStandingsTable faction={faction} data={data} />
        <PlayerStandingsFactionInfo faction={faction} data={data} />
      </Group>
    </>
  );
};

export default PlayerStandingsFaction;
