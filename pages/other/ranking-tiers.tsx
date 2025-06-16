import { NextPage } from "next";
import React, { useEffect } from "react";
import { AnalyticsRankingTiersPageView } from "../../src/firebase/analytics";
import Head from "next/head";
import { Container, Text, Title } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { PlayerRanks } from "../../src/coh3/coh3-data";
import Image from "next/image";
import { generateAlternateLanguageLinks, generateKeywordsString } from "../../src/head-utils";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const RankingTiers: NextPage = () => {
  const { t } = useTranslation("ranking-tiers");
  const { asPath } = useRouter();

  useEffect(() => {
    AnalyticsRankingTiersPageView();
  }, []);

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
        {generateAlternateLanguageLinks(asPath)}
      </Head>
      <>
        <Container size={"sm"}>
          <Title order={1} pb="md">
            {t("title")}
          </Title>
          <Text fz="sm">
            {t("description")}
            <br />
            {t("matchRequirement")}
          </Text>
          <DataTable
            records={playerRanksAsArray}
            highlightOnHover
            style={{
              marginTop: 20,
            }}
            verticalSpacing={4}
            idAccessor={"name"}
            columns={[
              {
                accessor: "icon",
                textAlign: "center",
                title: "",
                render: ({ url }) => {
                  return (
                    <Image src={url} width={28} height={28} alt={"rank icon"} loading="lazy" />
                  );
                },
              },
              {
                accessor: "name",
                textAlign: "left",
                title: t("table.columns.tierName"),
              },
              {
                accessor: "min",
                textAlign: "center",
                title: t("table.columns.eloRating"),
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
                textAlign: "center",
                title: t("table.columns.rank"),
                render: ({ rank }) => {
                  if (rank > 0) {
                    return <>{t("table.topPlayers", { count: rank })}</>;
                  }
                  return <></>;
                },
              },
            ]}
          />
          <div style={{ marginTop: 20 }}>
            <Title order={4}>{t("rankDecay.title")}</Title>
            <Text fz="sm" fs="italic" mb={16}>
              {t("rankDecay.text")}
            </Text>

            <Title order={4}>{t("eloDecay.title")}</Title>
            <Text fz="sm" fs="italic">
              {t("eloDecay.text")}
            </Text>
          </div>
        </Container>
      </>
    </div>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "ranking-tiers"])),
    },
  };
};

export default RankingTiers;
