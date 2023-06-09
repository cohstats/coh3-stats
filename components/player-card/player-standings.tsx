import { InternalStandings, platformType } from "../../src/coh3/coh3-types";
import { Container, Space } from "@mantine/core";
import React from "react";
import PlayerStandingsFaction from "./standings/player-standings-faction";

const PlayerStandings = ({
  playerStandings,
  platform,
}: {
  playerStandings: InternalStandings;
  platform: platformType;
}) => {
  return (
    <Container size={"xl"}>
      <Space h="xs" />
      <PlayerStandingsFaction
        faction={"german"}
        data={playerStandings.german}
        platform={platform}
      />
      <Space h="xs" />
      <PlayerStandingsFaction
        faction={"american"}
        data={playerStandings.american}
        platform={platform}
      />
      <Space h="xs" />
      <PlayerStandingsFaction faction={"dak"} data={playerStandings.dak} platform={platform} />
      <Space h="xs" />
      <PlayerStandingsFaction
        faction={"british"}
        data={playerStandings.british}
        platform={platform}
      />
    </Container>
  );
};

export default PlayerStandings;
