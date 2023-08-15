import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
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
  Tooltip,
} from "@mantine/core";
import { getStatsData } from "../../src/coh3stats-api";
import { getAnalysisStatsHttpResponse } from "../../src/analysis-types";
import { DatePickerInput } from "@mantine/dates";
// import {getDateTimestamp} from "../../src/utils";
import { useRouter } from "next/router";
import {
  convertFromDateString,
  convertToDateString,
  findPatchVersionByToAndFrom,
  getDateTimestamp,
  getGMTTimeStamp,
} from "../../src/utils";
import config from "../../config";
import InnerStatsPage from "../../components/screens/stats/game/inner-stats-page";

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
  const [patchSelectValue, setPatchSelectValue] = useState<string | null>(null);

  const [data, setData] = useState<null | getAnalysisStatsHttpResponse>(null);
  const [mode, setMode] = useState<"all" | "1v1" | "2v2" | "3v3" | "4v4">("1v1");
  const [valueDatePicker, setValueDatePicker] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Todo add analytics

    const queryParams = new URLSearchParams(window.location.search);
    const fromQuery = queryParams.get("from")
      ? convertFromDateString(queryParams.get("from") as string)
      : null;
    const toQuery = queryParams.get("to")
      ? convertFromDateString(queryParams.get("to") as string)
      : null;

    const defaultPatchView = config.statsPatchSelector[config.defaultStatsPatchSelector];

    if (!fromQuery && !toQuery && defaultPatchView) {
      push(
        { query: { ...query, from: defaultPatchView.from, to: defaultPatchView.to } },
        undefined,
        {
          shallow: true,
        },
      );
    }
  }, []);

  useEffect(() => {
    const fromQuery = query.from ? convertFromDateString(query.from as string) : null;
    const toQuery = query.to ? convertFromDateString(query.to as string) : null;
    const modeQuery = query.mode ? (query.mode as string) : null;

    if (
      !(
        valueDatePicker[0]?.getTime() === fromQuery?.getTime() &&
        valueDatePicker[1]?.getTime() === toQuery?.getTime()
      )
    ) {
      setValueDatePicker([fromQuery, toQuery]);
    }

    if (modeQuery && modeQuery !== mode) {
      setMode(modeQuery as any);
    }
  }, [query]);

  useEffect(() => {
    if (!valueDatePicker?.[0] || !valueDatePicker?.[1]) return;

    const fromTimeStamp = convertToDateString(valueDatePicker[0]);
    //  getDateTimestamp(valueDatePicker[0] || new Date() );
    const toTimeStamp = convertToDateString(valueDatePicker[1]); // getDateTimestamp(valueDatePicker[1] || new Date());
    push({ query: { ...query, from: fromTimeStamp, to: toTimeStamp } }, undefined, {
      shallow: true,
    });

    setPatchSelectValue(findPatchVersionByToAndFrom(fromTimeStamp, toTimeStamp));
  }, [valueDatePicker]);

  const selectMode = (value: "all" | "1v1" | "2v2" | "3v3" | "4v4") => {
    setMode(value);
    push({ query: { ...query, mode: value } }, undefined, {
      shallow: true,
    });
  };

  const selectPatchDate = (value: string) => {
    const selectedPatch = config.statsPatchSelector[value];
    if (!selectedPatch) return;
    setPatchSelectValue(value);

    push({ query: { ...query, from: selectedPatch.from, to: selectedPatch.to } }, undefined, {
      shallow: true,
    });
  };

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <>
        <Container size={"xl"}>
          <Flex align={"flex-end"} justify="center" wrap={"wrap"} gap="md">
            <Select
              value={patchSelectValue}
              label="Select Patch"
              placeholder="Custom date"
              onChange={selectPatchDate}
              data={Object.values(config.statsPatchSelector)}
              w={140}
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
            <Tooltip label="TBD - To be added in future">
              <Select
                disabled={true}
                label="ELO"
                defaultValue="all"
                data={[
                  { value: "all", label: "All" },
                  {
                    value: "<1000",
                    label: "< 1000",
                    disabled: true,
                  },
                  {
                    value: "1000-1200",
                    label: "1000 - 1200",
                    disabled: true,
                  },
                  {
                    value: "1000-1200",
                    label: "TBD",
                    disabled: true,
                  },
                ]}
                w={120}
              />
            </Tooltip>
            <SegmentedControl
              size="sm"
              data={[
                { label: "All", value: "all", disabled: true },
                { label: "1 vs 1", value: "1v1" },
                { label: "2 vs 2", value: "2v2" },
                { label: "3 vs 3", value: "3v3" },
                { label: "4 vs 4", value: "4v4" },
              ]}
              value={mode}
              onChange={selectMode}
            />
          </Flex>

          <InnerStatsPage
            mode={mode}
            timeStamps={{
              from: valueDatePicker[0] ? getGMTTimeStamp(valueDatePicker[0] || new Date()) : null,
              to: valueDatePicker[1] ? getGMTTimeStamp(valueDatePicker[1] || new Date()) : null,
            }}
          />
        </Container>
      </>
    </div>
  );
};

export default GameStats;
