import {
  InternalStandings,
  platformType,
  ProcessedCOHPlayerStats,
  TopTeamsSummary,
} from "../../../../src/coh3/coh3-types";
import { Container, Flex, Space } from "@mantine/core";
import React from "react";
import PlayerStandingsFaction from "./player-standings-faction";
import StandingsSummaryCharts from "./summary-header/standing-summary-charts";
import NemesisWidget from "./widgets/nemesis-widget";
import MoreButton from "../components/more-button";
import { useRouter } from "next/router";
import MapsWidget from "./widgets/maps-widget";
import { useTranslation } from "next-i18next";
import AliasHistoryWidget from "./widgets/alias-history-widget";
import TopTeamsInfo from "./top-teams-info";

const PlayerStandingsTab = ({
  playerStandings,
  playerStatsData,
  platform,
  topTeamsSummary,
  profileID,
}: {
  playerStandings: InternalStandings;
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: platformType;
  topTeamsSummary: TopTeamsSummary | null;
  profileID?: string;
}) => {
  const { push, query } = useRouter();
  const { t } = useTranslation("players");

  const changeView = async (value: string) => {
    await push({ query: { ...query, view: value } });
  };

  return (
    <Container size={"xl"} pl={0} pr={0}>
      <Space h="xs" />
      <StandingsSummaryCharts
        playerStandings={playerStandings}
        playerStatsData={playerStatsData}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-30px" }}>
        <MoreButton onClick={() => changeView("activity")} />
      </div>
      <Space h="xs" />
      <Flex gap="xs" wrap={"wrap"} justify={"space-between"}>
        <div style={{ flexGrow: 1 }}>
          <PlayerStandingsFaction
            faction={"german"}
            data={playerStandings.german}
            platform={platform}
            moreButtonOnClick={() => changeView("standingsDetails")}
            t={t}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"american"}
            data={playerStandings.american}
            platform={platform}
            moreButtonOnClick={() => changeView("standingsDetails")}
            t={t}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"dak"}
            data={playerStandings.dak}
            platform={platform}
            moreButtonOnClick={() => changeView("standingsDetails")}
            t={t}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"british"}
            data={playerStandings.british}
            platform={platform}
            moreButtonOnClick={() => changeView("standingsDetails")}
            t={t}
          />
          <Space h="xl" />
          <TopTeamsInfo topTeamsSummary={topTeamsSummary} t={t} profileID={profileID || ""} />
        </div>

        <div style={{ width: 300 }}>
          <Space h="xl" />
          <Space h="xs" />
          <MapsWidget playerStatsData={playerStatsData} playerStandings={playerStandings} />
          <Space h="md" />
          <NemesisWidget
            playerStatsData={playerStatsData}
            moreButtonOnClick={() => changeView("nemesis")}
          />
          <Space h="md" />
          <AliasHistoryWidget playerStatsData={playerStatsData} />
        </div>
      </Flex>
    </Container>
  );
};

export default PlayerStandingsTab;
