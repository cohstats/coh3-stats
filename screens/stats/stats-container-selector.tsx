import React, { useEffect, useState } from "react";
import {
  AnalyticsGameStatsModeSelection,
  AnalyticsGameStatsPageView,
  AnalyticsGameStatsPatchSelection,
  AnalyticsMapStatsModeSelection,
  AnalyticsMapStatsPageView,
} from "../../src/firebase/analytics";
import { Container, Flex, SegmentedControl, Select, Tooltip } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useRouter } from "next/router";
import {
  convertFromDateString,
  convertToDateString,
  findPatchVersionByToAndFrom,
  getGMTTimeStamp,
} from "../../src/utils";
import config from "../../config";
import InnerGameStatsPage from "./game/inner-game-stats-page";
import InnerMapsStatsPage from "./maps/inner-maps-stats-page";

const StatsContainerSelector = ({ statsType }: { statsType: "gameStats" | "mapStats" }) => {
  const { push, query } = useRouter();
  const [patchSelectValue, setPatchSelectValue] = useState<string | null>(null);

  const [mode, setMode] = useState<"all" | "1v1" | "2v2" | "3v3" | "4v4">("1v1");
  const [valueDatePicker, setValueDatePicker] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  useEffect(() => {
    if (statsType === "gameStats") {
      AnalyticsGameStatsPageView();
    } else {
      AnalyticsMapStatsPageView();
    }

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

    const fromTimeStamp = convertToDateString(valueDatePicker[0], false);
    //  getDateTimestamp(valueDatePicker[0] || new Date() );
    const toTimeStamp = convertToDateString(valueDatePicker[1]); // getDateTimestamp(valueDatePicker[1] || new Date());
    push({ query: { ...query, from: fromTimeStamp, to: toTimeStamp } }, undefined, {
      shallow: true,
    });

    setPatchSelectValue(findPatchVersionByToAndFrom(fromTimeStamp, toTimeStamp));
  }, [valueDatePicker]);

  const selectMode = (value: "all" | "1v1" | "2v2" | "3v3" | "4v4") => {
    if (statsType === "gameStats") {
      AnalyticsGameStatsModeSelection(value);
    } else {
      AnalyticsMapStatsModeSelection(value);
    }

    setMode(value);
    push({ query: { ...query, mode: value } }, undefined, {
      shallow: true,
    });
  };

  const selectPatchDate = (value: string) => {
    const selectedPatch = config.statsPatchSelector[value];
    if (!selectedPatch) return;
    setPatchSelectValue(value);
    AnalyticsGameStatsPatchSelection(value);

    push({ query: { ...query, from: selectedPatch.from, to: selectedPatch.to } }, undefined, {
      shallow: true,
    });
  };

  const segmentedControlGameTypeData = [
    ...(statsType === "gameStats" ? [{ label: "All", value: "all", disabled: true }] : []),
    { label: "1 vs 1", value: "1v1" },
    { label: "2 vs 2", value: "2v2" },
    { label: "3 vs 3", value: "3v3" },
    { label: "4 vs 4", value: "4v4" },
  ];

  return (
    <>
      <Container fluid p={0}>
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
            data={segmentedControlGameTypeData}
            value={mode}
            onChange={selectMode}
          />
        </Flex>
        {statsType === "gameStats" && (
          <InnerGameStatsPage
            mode={mode}
            timeStamps={{
              from: valueDatePicker[0] ? getGMTTimeStamp(valueDatePicker[0]) : null,
              to: valueDatePicker[1] ? getGMTTimeStamp(valueDatePicker[1]) : null,
            }}
          />
        )}
        {statsType === "mapStats" && (
          <InnerMapsStatsPage
            mode={mode as "1v1" | "2v2" | "3v3" | "4v4"}
            timeStamps={{
              from: valueDatePicker[0] ? getGMTTimeStamp(valueDatePicker[0]) : null,
              to: valueDatePicker[1] ? getGMTTimeStamp(valueDatePicker[1]) : null,
            }}
          />
        )}
      </Container>
    </>
  );
};

export default StatsContainerSelector;
