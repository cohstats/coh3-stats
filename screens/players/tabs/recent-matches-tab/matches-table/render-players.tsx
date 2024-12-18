import { Anchor, Group, Text, Tooltip } from "@mantine/core";
import { PlayerReport, raceID } from "../../../../../src/coh3/coh3-types";
import { raceIDs } from "../../../../../src/coh3/coh3-data";
import Link from "next/link";

import React from "react";
import CountryFlag from "../../../../../components/country-flag";
import EllipsisText from "../../../../../components/other/ellipsis-text";
import FactionIcon from "../../../../../components/faction-icon";

interface RenderPlayersProps {
  playerReports: Array<PlayerReport>;
  // ID of the player
  profileID: number | string;
  matchType: number;
  renderFlag: boolean;
}

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

const customGameELOWithTooltip = ({ rating }: { rating: number }) => {
  return (
    <Tooltip
      withArrow
      multiline
      style={{ maxWidth: "30ch" }}
      label={"ELO displayed in custom games is not accurate. Custom games doesn't affect ELO."}
    >
      <span>{rating}*</span>
    </Tooltip>
  );
};

const RenderPlayer = ({
  playerInfo,
  profileID,
  matchType,
  renderFlag,
}: {
  playerInfo: PlayerReport;
  profileID: number | string;
  matchType: number;
  renderFlag: boolean;
}) => {
  const isCustomGame = matchType === 0;

  const matchHistory = playerInfo.matchhistorymember;
  let ratingPlayedWith: string | JSX.Element = `${matchHistory.oldrating}`;
  const ratingChange = matchHistory.newrating - matchHistory.oldrating;
  let ratingChangeAsElement =
    ratingChange > 0 ? (
      <Text span c={"green"} fz={"sm"}>
        +{ratingChange}
      </Text>
    ) : ratingChange < 0 ? (
      <Text span c={"red"} fz={"sm"}>
        {ratingChange}
      </Text>
    ) : (
      <Text span fz={"sm"}>
        {ratingChange}
      </Text>
    );

  // Custom games rating change doesn't make sense
  ratingChangeAsElement = isCustomGame ? <></> : ratingChangeAsElement;

  // Check for unranked
  ratingPlayedWith =
    matchHistory.losses + matchHistory.wins >= 10 ? ratingPlayedWith : unrankedWithTooltip;
  // Check for custom games
  ratingPlayedWith = isCustomGame
    ? customGameELOWithTooltip({ rating: matchHistory.oldrating })
    : ratingPlayedWith;

  const ratingElement = (
    <>
      <span style={{ width: "4ch", textAlign: "left" }}>{ratingPlayedWith}</span>
      <span>{ratingChangeAsElement}</span>
    </>
  );

  return (
    <div key={playerInfo.profile_id}>
      <Group gap={"xs"}>
        <FactionIcon name={raceIDs[playerInfo.race_id as raceID]} width={20} />
        <> {ratingElement}</>
        <Anchor
          rel={"referrer"}
          key={playerInfo.profile_id}
          component={Link}
          href={`/players/${playerInfo.profile_id}`}
        >
          {`${playerInfo.profile_id}` === `${profileID}` ? (
            <Text fz={"sm"} span fw={700}>
              <Group gap="xs">
                {" "}
                {renderFlag && <CountryFlag countryCode={playerInfo.profile.country} />}
                <EllipsisText text={playerInfo.profile["alias"]} />
              </Group>
            </Text>
          ) : (
            <Text span fz={"sm"}>
              <Group gap="xs">
                {renderFlag && <CountryFlag countryCode={playerInfo.profile.country} />}
                <EllipsisText text={playerInfo.profile["alias"]} />
              </Group>
            </Text>
          )}
        </Anchor>
      </Group>
    </div>
  );
};

const RenderPlayers = ({
  playerReports,
  profileID,
  matchType,
  renderFlag = true,
}: RenderPlayersProps) => {
  return (
    <>
      {playerReports.map((playerInfo: PlayerReport) => {
        return (
          <RenderPlayer
            playerInfo={playerInfo}
            profileID={profileID}
            matchType={matchType}
            renderFlag={renderFlag}
            key={playerInfo.profile_id}
          />
        );
      })}
    </>
  );
};

export { RenderPlayers, RenderPlayer };

export default RenderPlayers;
