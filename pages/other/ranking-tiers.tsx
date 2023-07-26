import { NextPage } from "next";
import React, { useEffect } from "react";
import { AnalyticsRankingTiersPageView } from "../../src/firebase/analytics";
import Head from "next/head";
import { Container, Text, Title } from "@mantine/core";

import { DataTable } from "mantine-datatable";

import { PlayerRanks } from "../../src/coh3/coh3-data";
import Image from "next/image";
import { generateKeywordsString } from "../../src/head-utils";

const RankingTiers: NextPage = () => {
  useEffect(() => {
    AnalyticsRankingTiersPageView();
  }, []);

  // PlayerRanks
  const playerRanksAsArray = Object.values(PlayerRanks).reverse();

  const pageTitle = `Ranking Tiers - Company of Heroes 3`;
  const keywords = generateKeywordsString([
    "coh3 ranks",
    "tiers",
    "leagues, tier rank",
    "coh3 leagues",
  ]);

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Ranking tiers in Company of Heroes 3. All Leagues and Tier ranks exaplined."
        />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={PlayerRanks.CHALLENGER_1.url} />
      </Head>
      <>
        <Container size={"sm"}>
          {" "}
          <Title order={2} pt="md">
            Ranking Tiers in Company of Heroes 3
          </Title>
          <Text fz="sm">
            Based on the player ELO, players are placed into specific League and Tier.
            <br />
            Player needs at least 10 matches for each faction in a specific game to earn a rank
            and be placed in a tier.
          </Text>
          <DataTable
            records={playerRanksAsArray}
            highlightOnHover
            // withBorder
            // borderRadius="md"
            style={{
              // maxWidth: 600,
              marginTop: 20,
            }}
            // horizontalSpacing={"xs"}
            verticalSpacing={4}
            idAccessor={"name"}
            columns={[
              {
                accessor: "icon",
                textAlignment: "center",
                title: "",
                render: ({ url }) => {
                  return (
                    <Image src={url} width={28} height={28} alt={"rank icon"} loading="lazy" />
                  );
                },
              },
              {
                accessor: "name",
                textAlignment: "left",
                title: "Tier Name",
              },
              {
                accessor: "min",
                textAlignment: "center",
                title: "ELO Rating",
                render: ({ min, max }) => {
                  if (max === 5000) {
                    return <>{min}+</>;
                  } else if (min === -1) {
                    return <>Unranked</>;
                  }

                  return (
                    <>
                      {min} - {max}
                    </>
                  );
                },
              },
              {
                accessor: "rank",
                textAlignment: "center",
                title: "Rank",
                render: ({ rank }) => {
                  if (rank > 0) {
                    return <>Top {rank} players</>;
                  }
                  return <></>;
                },
              },
            ]}
          />
          <Text fz="sm" fs="italic">
            Note: If a player doesn&apos;t play for a long time, they loose their rank. But you
            need to play just 1 game to get it back.
          </Text>
        </Container>
      </>
    </div>
  );
};

export default RankingTiers;
