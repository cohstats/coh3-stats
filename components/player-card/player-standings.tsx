import { InternalStandings } from "../../src/coh3/coh3-types";
import { Container, Space } from "@mantine/core";
import React from "react";
import PlayerStandingsFaction from "./standings/player-standings-faction";

const PlayerStandings = ({ playerStandings }: { playerStandings: InternalStandings }) => {
  return (
    <Container size={"xl"}>
      <Space h="xs" />
      <PlayerStandingsFaction faction={"german"} data={playerStandings.german} />
      <Space h="xs" />
      <PlayerStandingsFaction faction={"american"} data={playerStandings.american} />
      <Space h="xs" />
      <PlayerStandingsFaction faction={"dak"} data={playerStandings.dak} />
      <Space h="xs" />
      <PlayerStandingsFaction faction={"british"} data={playerStandings.british} />
    </Container>
  );
};

export default PlayerStandings;
