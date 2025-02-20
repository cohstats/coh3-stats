import React, { useEffect, useState } from "react";
import {
  AnalyticsGameStatsModeSelection,
  AnalyticsGameStatsPageView,
  AnalyticsGameStatsPatchSelection,
  AnalyticsMapStatsModeSelection,
  AnalyticsMapStatsPageView,
} from "../../src/firebase/analytics";
import {
  Anchor,
  Button,
  Container,
  Flex,
  HoverCard,
  MultiSelect,
  SegmentedControl,
  Select,
  Spoiler,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useRouter } from "next/router";
import {
  convertFromDateString,
  convertToDateString,
  findPatchVersionByToAndFrom,
  getGMTTimeStamp,
  getPatchVersionAsMantineV7Groups,
} from "../../src/utils";
import config from "../../config";
import InnerGameStatsPage from "./game/inner-game-stats-page";
import InnerMapsStatsPage from "./maps/inner-maps-stats-page";
import { analysisFilterType, analysisMapFilterType } from "../../src/analysis-types";
import { IconInfoCircle } from "@tabler/icons-react";
import { getAboutRoute } from "../../src/routes";

const patchSelectorData = getPatchVersionAsMantineV7Groups();

const StatsContainerSelector = ({ statsType }: { statsType: "gameStats" | "mapStats" }) => {
  const { push, query } = useRouter();
  const [patchSelectValue, setPatchSelectValue] = useState<string | null>(null);

  const [mode, setMode] = useState<"all" | "1v1" | "2v2" | "3v3" | "4v4">("1v1");
  const [valueDatePicker, setValueDatePicker] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [filters, setFilters] = useState<
    Array<analysisFilterType | analysisMapFilterType | "all">
  >(["all"]);
  const [multiFilter, setMultiFilter] = useState<Array<string>>([]);
  const [disabledMultiFilter, setDisabledMultiFilter] = useState({
    averageDisabled: false,
    averageExDisabled: false,
    limitDisabled: false,
  });

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
    const selectedFiltersQuery = query.filters ? (query.filters as string).split(",") : null;

    if (JSON.stringify(selectedFiltersQuery) !== JSON.stringify(filters)) {
      setFilters(selectedFiltersQuery as analysisFilterType[]);

      if (selectedFiltersQuery && selectedFiltersQuery.length > 1) {
        setMultiFilter(selectedFiltersQuery);
      }
    }

    if (
      !(
        valueDatePicker[0]?.getTime() === fromQuery?.getTime() &&
        valueDatePicker[1]?.getTime() === toQuery?.getTime()
      )
    ) {
      setValueDatePicker([fromQuery, toQuery]);
    }

    if (
      modeQuery &&
      modeQuery !== mode &&
      (modeQuery === "all" ||
        modeQuery === "1v1" ||
        modeQuery === "2v2" ||
        modeQuery === "3v3" ||
        modeQuery === "4v4")
    ) {
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

  useEffect(() => {
    const hasLimitFilter = multiFilter.some((filter) => filter.startsWith("stats-limit-"));
    const hasAverageFilter = multiFilter.some((filter) => /^stats-average-\d/.test(filter));
    const hasAverageExFilter = multiFilter.some((filter) =>
      filter.startsWith("stats-average-ex-"),
    );

    if (hasLimitFilter) {
      setDisabledMultiFilter({
        averageDisabled: true,
        averageExDisabled: true,
        limitDisabled: false,
      });
    } else if (hasAverageFilter) {
      setDisabledMultiFilter({
        averageDisabled: false,
        averageExDisabled: true,
        limitDisabled: true,
      });
    } else if (hasAverageExFilter) {
      setDisabledMultiFilter({
        averageDisabled: true,
        averageExDisabled: false,
        limitDisabled: true,
      });
    } else {
      setDisabledMultiFilter({
        averageDisabled: false,
        averageExDisabled: false,
        limitDisabled: false,
      });
    }
  }, [multiFilter]);

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

  const selectPatchDate = (value: string | null) => {
    if (!value) return;
    const selectedPatch = config.statsPatchSelector[value];
    if (!selectedPatch) return;
    setPatchSelectValue(value);
    AnalyticsGameStatsPatchSelection(value);

    push({ query: { ...query, from: selectedPatch.from, to: selectedPatch.to } }, undefined, {
      shallow: true,
    });
  };

  const selectEloSimpleFilter = (value: string) => {
    setFilters([value as analysisFilterType]);

    push({ query: { ...query, filters: value } }, undefined, {
      shallow: true,
    });
  };

  const generateEloAdvancedFilter = () => {
    setFilters(multiFilter as analysisFilterType[]);

    push({ query: { ...query, filters: multiFilter.join(",") } }, undefined, {
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

  const ELOFilterDataStats = [
    {
      group: "All ELO Groups",
      items: [
        {
          value: "all",
          label: "All",
          disabled: false,
        },
      ],
    },
    {
      group: "Average",
      items: [
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1800-9999`,
          label: "Average 1800+",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1700-9999`,
          label: "Average 1700+",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1600-9999`,
          label: "Average 1600+",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1700-1999`,
          label: "Average 1700-1999",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1600-1799`,
          label: "Average 1600-1799",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1400-1599`,
          label: "Average 1400-1599",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1250-1399`,
          label: "Average 1250-1399",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-1100-1249`,
          label: "Average 1100-1249",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-800-1099`,
          label: "Average 800-1099",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-0-799`,
          label: "Average 0-799",
          disabled: disabledMultiFilter.averageDisabled,
        },
      ],
    },
    {
      group: "Average Fair Matchup",
      items: [
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1800-9999`,
          label: "Average Fair 1800+",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1700-9999`,
          label: "Average Fair 1700+",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1600-9999`,
          label: "Average Fair 1600+",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1700-1999`,
          label: "Average Fair 1700-1999",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1600-1799`,
          label: "Average Fair 1600-1799",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1400-1599`,
          label: "Average Fair 1400-1599",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1250-1399`,
          label: "Average Fair 1250-1399",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-1100-1249`,
          label: "Average Fair 1100-1249",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-800-1099`,
          label: "Average Fair 800-1099",
          disabled: disabledMultiFilter.averageDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-fair-0-799`,
          label: "Average Fair 0-799",
          disabled: disabledMultiFilter.averageDisabled,
        },
      ],
    },
    {
      group: "Average Ex 400 diff",
      items: [
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1800-9999`,
          label: "Average Ex 1800+",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1700-9999`,
          label: "Average Ex 1700+",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1600-9999`,
          label: "Average Ex 1600+",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1700-1999`,
          label: "Average Ex 1700-1999",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1600-1799`,
          label: "Average Ex 1600-1799",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1400-1599`,
          label: "Average Ex 1400-1599",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1250-1399`,
          label: "Average Ex 1250-1399",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-1100-1249`,
          label: "Average Ex 1100-1249",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-800-1099`,
          label: "Average Ex 800-1099",
          disabled: disabledMultiFilter.averageExDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-average-ex-0-799`,
          label: "Average Ex 0-799",
          disabled: disabledMultiFilter.averageExDisabled,
        },
      ],
    },
    {
      group: "Hard limit",
      items: [
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1800-9999`,
          label: "Limit 1800+",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1700-9999`,
          label: "Limit 1700+",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1600-9999`,
          label: "Limit 1600+",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1700-1999`,
          label: "Limit 1700-1999",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1600-1799`,
          label: "Limit 1600-1799",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1400-1599`,
          label: "Limit 1400-1599",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1250-1399`,
          label: "Limit 1250-1399",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-1100-1249`,
          label: "Limit 1100-1249",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-800-1099`,
          label: "Limit 800-1099",
          disabled: disabledMultiFilter.limitDisabled,
        },
        {
          value: `${statsType === "gameStats" ? "stats" : "mapStats"}-limit-0-799`,
          label: "Limit 0-799",
          disabled: disabledMultiFilter.limitDisabled,
        },
      ],
    },
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
            data={patchSelectorData}
            withCheckIcon={false}
            w={145}
          />
          <DatePickerInput
            type="range"
            label="Pick dates range"
            value={valueDatePicker}
            onChange={setValueDatePicker}
            w={305}
            // mx={10}
            // mx="auto"

            // maw={300}
            // miw={270}
            allowSingleDateInRange={true}
            minDate={new Date(2023, 6, 1)}
            maxDate={new Date()}
          />

          <Select
            withCheckIcon={false}
            label={
              <>
                <HoverCard width={350} shadow="md">
                  <HoverCard.Target>
                    <div>
                      ELO Filter <IconInfoCircle size={20} />
                    </div>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text fw={450}>
                      <Anchor href={getAboutRoute("stats")}>
                        Learn more about Stats and ELO Filters
                      </Anchor>
                      <br />
                      <b>Average Group</b> - Average ELO of all players fit in the specified group
                      <br />
                      <b>Average Fair Matchup</b> - Average ELO of all players fit in the
                      specified group while the difference between the teams ELO is bellow 20%
                      <br />
                      <b>Average Excluded Group</b> - Average ELO of all players fit into
                      specified group while the difference between the lowest ELO player and
                      highest ELO player in the match is bellow 400
                      <br />
                      <b>Limit Group</b> - ELO of all players in the match must fit into specified
                      group
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </>
            }
            defaultValue="all"
            value={(filters && filters[0]) || "all"}
            onChange={(value) => selectEloSimpleFilter(value as string)}
            data={ELOFilterDataStats}
            disabled={multiFilter.length > 0}
            w={200}
            allowDeselect={false}
          />

          <SegmentedControl
            size="sm"
            data={segmentedControlGameTypeData}
            value={mode}
            onChange={(value) => selectMode(value as "all" | "1v1" | "2v2" | "3v3" | "4v4")}
          />
        </Flex>

        <Flex justify={"center"} pt={"sm"}>
          <Spoiler
            maxHeight={0}
            showLabel={`Advanced ELO filtering ${filters?.length > 1 ? "- applied" : ""}`}
            hideLabel="Hide"
          >
            <Flex align={"flex-end"} justify="center" wrap={"wrap"} gap="md">
              <MultiSelect
                label="Select multiple ELO Filters"
                placeholder="Pick value"
                data={ELOFilterDataStats.slice(1)}
                value={multiFilter}
                onChange={setMultiFilter}
                clearable
                w={600}
              />
              <Button
                variant="default"
                onClick={generateEloAdvancedFilter}
                disabled={multiFilter.length === 0}
              >
                Generate Analysis
              </Button>
            </Flex>
          </Spoiler>
        </Flex>

        {statsType === "gameStats" && (
          <InnerGameStatsPage
            mode={mode}
            timeStamps={{
              from: valueDatePicker[0] ? getGMTTimeStamp(valueDatePicker[0]) : null,
              to: valueDatePicker[1] ? getGMTTimeStamp(valueDatePicker[1]) : null,
            }}
            filters={filters}
          />
        )}
        {statsType === "mapStats" && (
          <InnerMapsStatsPage
            mode={mode as "1v1" | "2v2" | "3v3" | "4v4"}
            timeStamps={{
              from: valueDatePicker[0] ? getGMTTimeStamp(valueDatePicker[0]) : null,
              to: valueDatePicker[1] ? getGMTTimeStamp(valueDatePicker[1]) : null,
            }}
            filters={filters}
          />
        )}
      </Container>
    </>
  );
};

export default StatsContainerSelector;
