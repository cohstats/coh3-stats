import { Anchor, Group, Text } from "@mantine/core";
import Link from "next/link";

import React from "react";
import { PlayersOnLiveGames, raceID, TypeOfLiveGame } from "../../src/coh3/coh3-types";
import FactionIcon from "../../components/faction-icon";
import { raceIDs } from "../../src/coh3/coh3-data";
import CountryFlag from "../../components/country-flag";
import EllipsisText from "../../components/other/ellipsis-text";

interface RenderPlayersProps {
  playerReports: Array<PlayersOnLiveGames>;
  type: TypeOfLiveGame | null;
  renderFlag: boolean;
}

const RenderPlayer = ({
  playerInfo,
  renderFlag,
  type,
}: {
  playerInfo: PlayersOnLiveGames;
  renderFlag: boolean;
  type: TypeOfLiveGame | null;
}) => {
  return (
    <div key={playerInfo.profile_id}>
      <Group gap={"xs"}>
        <FactionIcon name={raceIDs[playerInfo.race_id as raceID]} width={20} />
        {type !== "ai" && type !== "custom" && (
          <>
            R<span style={{ width: "4ch", textAlign: "left" }}>{playerInfo.rank}</span>{" "}
          </>
        )}
        <Anchor
          rel={"referrer"}
          key={playerInfo.profile_id}
          component={Link}
          href={`/players/${playerInfo.profile_id}`}
        >
          <Text span fz={"sm"}>
            <Group gap="xs">
              {renderFlag && <CountryFlag countryCode={playerInfo.player_profile.country} />}
              <EllipsisText text={playerInfo.player_profile["alias"]} />
            </Group>
          </Text>
        </Anchor>
      </Group>
    </div>
  );
};

const RenderPlayersLiveGames = ({
  playerReports,
  type,
  renderFlag = true,
}: RenderPlayersProps) => {
  return (
    <>
      {playerReports.map((playerInfo: PlayersOnLiveGames) => {
        return (
          <RenderPlayer
            playerInfo={playerInfo}
            renderFlag={renderFlag}
            key={playerInfo.profile_id}
            type={type}
          />
        );
      })}
    </>
  );
};

export default RenderPlayersLiveGames;
