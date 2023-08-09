import { NextPage } from "next";
import React, { useEffect, useState } from "react";
// import { AnalyticsGameStatsPageView } from "../../src/firebase/analytics";
import { generateKeywordsString } from "../../src/head-utils";
import Head from "next/head";
import { Container, Text, Title } from "@mantine/core";
import { getStatsData } from "../../src/coh3stats-api";
import { getAnalysisStatsHttpResponse } from "../../src/analysis-types";
import { DatePickerInput } from "@mantine/dates";
// import {getDateTimestamp} from "../../src/utils";
import { useRouter } from "next/router";
import {
  convertFromDateString,
  convertToDateString,
  getDateTimestamp,
  getGMTTimeStamp,
} from "../../src/utils";

const pageTitle = `Game Stats - Company of Heroes 3`;
const description = "Game Stats for Company of Heroes 3. See winrate of each faction and more.";
const keywords = generateKeywordsString([
  "coh3 winrate",
  "factions winrate",
  "analysis",
  "best faction",
]);

const GameStats: NextPage = () => {
  const { push, query } = useRouter();

  const [data, setData] = useState<null | getAnalysisStatsHttpResponse>(null);
  const [mode, setMode] = useState<"all" | "1v1" | "2v2" | "3v3" | "4v4">("1v1");
  const [valueDatePicker, setValueDatePicker] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fromQuery = query.from ? convertFromDateString(query.from as string) : null;
    const toQuery = query.to ? convertFromDateString(query.to as string) : null;

    if (
      valueDatePicker[0]?.getTime() === fromQuery?.getTime() &&
      valueDatePicker[1]?.getTime() === toQuery?.getTime()
    )
      return;
    setValueDatePicker([fromQuery, toQuery]);
  }, [query]);

  useEffect(() => {
    if (!valueDatePicker?.[0] || !valueDatePicker?.[1]) return;

    const fromTimeStamp = convertToDateString(valueDatePicker[0]);
    //  getDateTimestamp(valueDatePicker[0] || new Date() );
    const toTimeStamp = convertToDateString(valueDatePicker[1]); // getDateTimestamp(valueDatePicker[1] || new Date());
    push({ query: { ...query, from: fromTimeStamp, to: toTimeStamp } }, undefined, {
      shallow: true,
    });
  }, [valueDatePicker]);

  useEffect(() => {
    // AnalyticsGameStatsPageView();

    if (!valueDatePicker?.[0] || !valueDatePicker?.[1] || !valueDatePicker) return;
    (async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const data = await getStatsData(
          getDateTimestamp(valueDatePicker[0]),
          getDateTimestamp(valueDatePicker[1]),
        );
        setData(data);
      } catch (e: any) {
        console.error(`Failed getting stats data`);
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [valueDatePicker]);

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
          DatePicker Value: {valueDatePicker && JSON.stringify(valueDatePicker)}
          <br />
          Loading: {JSON.stringify(loading)}
          <DatePickerInput
            type="range"
            label="Pick dates range"
            placeholder="Pick dates range"
            value={valueDatePicker}
            onChange={setValueDatePicker}
            mx="auto"
            maw={300}
            allowSingleDateInRange={true}
            minDate={new Date(2023, 6, 1)}
            maxDate={new Date()}
          />
          Data validation:{" "}
          {data && new Date(data?.fromTimeStampSeconds * 1000).toLocaleDateString()} -{" "}
          {data && new Date(data?.toTimeStampSeconds * 1000).toLocaleDateString()}
          {data && JSON.stringify(data)}
        </Container>
      </>
    </div>
  );
};

export default GameStats;
