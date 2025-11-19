import {
  InternalStandings,
  platformType,
  ProcessedCOHPlayerStats,
} from "../../../../src/coh3/coh3-types";
import { Container, Flex, Space } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import PlayerStandingsFaction from "./player-standings-faction";
import StandingsSummaryCharts from "./summary-header/standing-summary-charts";
import NemesisWidget from "./widgets/nemesis-widget";
import MoreButton from "../components/more-button";
import { useRouter } from "next/router";
import MapsWidget from "./widgets/maps-widget";
import { useTranslation } from "next-i18next";
import AliasHistoryWidget from "./widgets/alias-history-widget";
import TopTeamsInfo from "./top-teams-info";
import { useIntersection } from "@mantine/hooks";

const PlayerStandingsTab = ({
  playerStandings,
  playerStatsData,
  platform,
  profileID,
}: {
  playerStandings: InternalStandings;
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: platformType;
  profileID?: string;
}) => {
  const { push, query } = useRouter();
  const { t } = useTranslation("players");

  // Render Top Teams only when the users scrolls down
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: containerRef.current,
    rootMargin: "300px",
    threshold: 0.1,
  });

  const [renderTopTeamsSummary, setRenderTopTeamsSummary] = useState(false);

  useEffect(() => {
    if (entry?.isIntersecting && !renderTopTeamsSummary) {
      setRenderTopTeamsSummary(true);
    }
  }, [entry, renderTopTeamsSummary]);

  const changeView = async (value: string, faction?: string) => {
    const newQuery = { ...query, view: value };
    if (faction) {
      newQuery.faction = faction;
    }
    await push({ query: newQuery });
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
            moreButtonOnClick={() => changeView("standingsDetails", "german")}
            t={t}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"american"}
            data={playerStandings.american}
            platform={platform}
            moreButtonOnClick={() => changeView("standingsDetails", "american")}
            t={t}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"dak"}
            data={playerStandings.dak}
            platform={platform}
            moreButtonOnClick={() => changeView("standingsDetails", "dak")}
            t={t}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"british"}
            data={playerStandings.british}
            platform={platform}
            moreButtonOnClick={() => changeView("standingsDetails", "british")}
            t={t}
          />
          <Space h="xl" />
          <div ref={ref} style={{ minHeight: 900 }}>
            {renderTopTeamsSummary && <TopTeamsInfo t={t} profileID={profileID || ""} />}
          </div>
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
