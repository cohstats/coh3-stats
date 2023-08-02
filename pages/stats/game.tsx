import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { AnalyticsGameStatsPageView } from "../../src/firebase/analytics";
import { generateKeywordsString } from "../../src/head-utils";
import Head from "next/head";
import { Container, Text, Title } from "@mantine/core";
import { getStatsData } from "../../src/coh3stats-api";
import { getAnalysisStatsHttpResponse } from "../../src/analysis-types";
import { DatePickerInput } from "@mantine/dates";

const pageTitle = `Game Stats - Company of Heroes 3`;
const description = "Game Stats for Company of Heroes 3. See winrate of each faction and more.";
const keywords = generateKeywordsString([
  "coh3 winrate",
  "factions winrate",
  "analysis",
  "best faction",
]);

const GameStats: NextPage = () => {
  const [data, setData] = useState<null | getAnalysisStatsHttpResponse>(null);
  const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);

  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    AnalyticsGameStatsPageView();

    (async () => {
      try {
        setLoading(true);
        const data = await getStatsData(1689016013);
        setData(data);
      } catch (e: any) {
        console.error(`Failed getting stats data`);
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <>
        <Container size={"sm"}>
          GGGGAME STATS
          {value && JSON.stringify(value)}
          <DatePickerInput
            type="range"
            label="Pick dates range"
            placeholder="Pick dates range"
            value={value}
            onChange={setValue}
            mx="auto"
            maw={300}
            allowSingleDateInRange={true}
            minDate={new Date(2023, 6, 1)}
            maxDate={new Date()}
          />
          {data && JSON.stringify(data)}
        </Container>
      </>
    </div>
  );
};

export default GameStats;
