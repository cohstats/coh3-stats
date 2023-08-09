import { NextPage } from "next";
import React, { useEffect, useState } from "react";
// import { AnalyticsGameStatsPageView } from "../../src/firebase/analytics";
import { generateKeywordsString } from "../../src/head-utils";
import Head from "next/head";
import {
  Container,
  Loader,
  Text,
  Title,
  Button,
  Group,
  Flex,
  SegmentedControl,
  Select,
} from "@mantine/core";
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
import config from "../../config";

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

    console.log(`setting valueDatePicker`);
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
        setData(null);

        // @ts-ignore
        const data = await getStatsData(
          getGMTTimeStamp(valueDatePicker[0] || new Date()),
          getGMTTimeStamp(valueDatePicker[1] || new Date()),
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
        <Container size={"md"}>
          <Flex align={"flex-end"} wrap={"wrap"} gap="md">
            <Select
              label="Select Patch"
              placeholder="Custom date range"
              onChange={(e) => {
                console.log(e);
              }}
              data={config.statsPatchSelector}
            />
            <DatePickerInput
              type="range"
              label="Pick dates range"
              placeholder="Pick dates range"
              value={valueDatePicker}
              onChange={setValueDatePicker}
              w={270}
              // mx={10}
              // mx="auto"

              // maw={300}
              // miw={270}
              allowSingleDateInRange={true}
              minDate={new Date(2023, 6, 1)}
              maxDate={new Date()}
            />
            <SegmentedControl
              size="sm"
              data={[
                { label: "All", value: "all" },
                { label: "1 vs 1", value: "1v1" },
                { label: "2 vs 2", value: "2v2" },
                { label: "3 vs 3", value: "3v3" },
                { label: "4 vs 4", value: "4v4" },
              ]}
            />
          </Flex>
          {loading && <Loader />}
          DatePicker Value: {valueDatePicker && JSON.stringify(valueDatePicker)}
          <br />
          Loading: {JSON.stringify(loading)}
          {data && JSON.stringify(data)}
        </Container>
      </>
    </div>
  );
};

export default GameStats;
