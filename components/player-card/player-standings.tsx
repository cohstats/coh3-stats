import { InternalStandings } from "../../src/coh3/coh3-types";
import PlayerStandingsTable from "./player-standings-table";
import { Space } from "@mantine/core";
import React from "react";

const PlayerStandings = ({ playerStandings }: { playerStandings: InternalStandings }) => {
  return (
    <>
      <Space h="xs" />
      <PlayerStandingsTable faction={"german"} data={playerStandings.german} />
      <Space h="xs" />
      <PlayerStandingsTable faction={"american"} data={playerStandings.american} />
      <Space h="xs" />
      <PlayerStandingsTable faction={"dak"} data={playerStandings.dak} />
      <Space h="xs" />
      <PlayerStandingsTable faction={"british"} data={playerStandings.british} />
    </>
  );
};

export default PlayerStandings;
