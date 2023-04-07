import { Anchor, Group, Text, Tooltip } from "@mantine/core";
import { PlayerReport, raceID } from "../../src/coh3/coh3-types";
import FactionIcon from "../faction-icon";
import { raceIDs } from "../../src/coh3/coh3-data";
import Link from "next/link";
import EllipsisText from "../other/ellipsis-text";
import React from "react";

interface RenderPlayersProps {
  playerReports: Array<PlayerReport>;
  // ID of the player
  profileID: number | string;
}

const RenderPlayers = ({ playerReports, profileID }: RenderPlayersProps) => {
  const unrankedWithTooltip = (
    <Tooltip
      withArrow
      multiline
      style={{ maxWidth: "30ch" }}
      label={"Player is un-ranked in this mode.\n Have less than 10 games."}
    >
      <Text c={"dimmed"}>N/A</Text>
    </Tooltip>
  );

  return (
    <>
      {playerReports.map((playerInfo: PlayerReport) => {
        const matchHistory = playerInfo.matchhistorymember;
        let ratingPlayedWith: string | JSX.Element = `${matchHistory.oldrating}`;
        const ratingChange = matchHistory.newrating - matchHistory.oldrating;
        const ratingChangeAsElement =
          ratingChange > 0 ? (
            <Text color={"green"}>+{ratingChange}</Text>
          ) : ratingChange < 0 ? (
            <Text color={"red"}>{ratingChange}</Text>
          ) : (
            <Text>{ratingChange}</Text>
          );

        ratingPlayedWith =
          matchHistory.losses + matchHistory.wins >= 10 ? ratingPlayedWith : unrankedWithTooltip;

        const ratingElement = (
          <>
            <span style={{ width: "4ch", textAlign: "left" }}>{ratingPlayedWith}</span>
            <span>{ratingChangeAsElement}</span>
          </>
        );

        return (
          <div key={playerInfo.profile_id}>
            <Group spacing={"xs"}>
              <FactionIcon name={raceIDs[playerInfo.race_id as raceID]} width={20} />
              <> {ratingElement}</>
              <Anchor
                rel={"noreferrer"}
                key={playerInfo.profile_id}
                component={Link}
                href={`/players/${playerInfo.profile_id}`}
              >
                {`${playerInfo.profile_id}` === `${profileID}` ? (
                  <Text fw={700}>
                    <EllipsisText text={playerInfo.profile["alias"]} />
                  </Text>
                ) : (
                  <Text>
                    <EllipsisText text={playerInfo.profile["alias"]} />
                  </Text>
                )}
              </Anchor>
            </Group>
          </div>
        );
      })}
    </>
  );
};

export default RenderPlayers;
