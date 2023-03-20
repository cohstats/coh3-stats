import { Badge, Text, Group, Button } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React from "react";
import { maps, matchTypesAsObject, raceIDs } from "../../src/coh3/coh3-data";
import { ProcessedMatch, raceID } from "../../src/coh3/coh3-types";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";
import ErrorCard from "../error-card";
import FactionIcon from "../faction-icon";
import { IconInfoCircle } from "@tabler/icons";
import sortBy from "lodash/sortBy";
import cloneDeep from "lodash/cloneDeep";
import FilterableHeader from "./filterable-header";
import RenderPlayers from "../matches-table/render-players";
import RenderMap from "../matches-table/render-map";
import DynamicTimeAgo from "../other/dynamic-timeago";
import { getPlayerMatchHistoryResult, isPlayerVictorious } from "../../src/players/utils";

/**
 * Timeago is causing issues with SSR, move to client side
 */

export type FilterInformation = { label: string; checked: boolean; filter: string | number };

const PlayerRecentMatches = ({
  profileID,
  playerMatchesData,
  error,
}: {
  profileID: string;
  playerMatchesData: Array<ProcessedMatch>;
  error: string;
}) => {
  const [sortStatus, setSortStatus] = React.useState<DataTableSortStatus>({
    columnAccessor: "Played",
    direction: "asc",
  });
  const [filters, setFilters] = React.useState<{
    [key: string]: { [key: string | number]: FilterInformation };
  }>({
    result: {},
    map: {},
    mode: {},
  });

  // filters then sorts the table
  const sortedData = React.useMemo(() => {
    // go through all filters and add only unchecked filters
    const toExclude: { [key: string]: string[] } = {};
    Object.entries(filters).forEach(([column, filterMap]) => {
      toExclude[column] = [];
      Object.entries(filterMap).forEach(([filter, filterInfo]) => {
        if (!filterInfo.checked) toExclude[column].push(filter);
      });
    });

    const resortedData = sortBy(
      playerMatchesData,
      sortStatus.columnAccessor === "match_duration"
        ? (matchData) => {
            return matchData.startgametime - matchData.completiontime;
          }
        : sortStatus.columnAccessor,
    ).filter((matchData) => {
      // checking the status of the record to filter is different for each column type so
      // thats why this messy logic is here
      let include = true;
      toExclude["result"]?.forEach((filter) => {
        if (filter === "victory" && isPlayerVictorious(matchData, profileID)) include = false;
        if (filter === "defeat" && !isPlayerVictorious(matchData, profileID)) include = false;
      });
      toExclude["map"].forEach((map: string) => {
        if (matchData.mapname === map) include = false;
      });
      toExclude["mode"].forEach((matchtype_id) => {
        if (matchData.matchtype_id.toString() === matchtype_id) include = false;
      });

      return include;
    });
    return sortStatus.direction === "desc" ? resortedData.reverse() : resortedData;
    // eslint wants isplayervictorious in here. I think this will make this run on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortStatus, playerMatchesData, filters]);

  // populate filters with values actually found in this players recent history
  React.useEffect(() => {
    const mapNameMap: { [key: string]: FilterInformation } = {};
    const matchTypeMap: { [key: number]: FilterInformation } = {};
    playerMatchesData?.forEach(({ mapname, matchtype_id }) => {
      mapNameMap[mapname] = {
        label: maps[mapname]?.name || mapname,
        checked: true,
        filter: mapname,
      };
      matchTypeMap[matchtype_id] = {
        label: (
          matchTypesAsObject[matchtype_id]["localizedName"] ||
          matchTypesAsObject[matchtype_id]["name"] ||
          "unknown"
        ).toLowerCase(),
        checked: true,
        filter: matchtype_id,
      };
    });

    const updatedFilters = {
      result: {
        victory: { label: "Victory", checked: true, filter: "victory" },
        defeat: { label: "Defeat", checked: true, filter: "defeat" },
      },
      map: mapNameMap,
      mode: matchTypeMap,
    };
    setFilters(updatedFilters);
  }, [playerMatchesData]);

  if (error) {
    return <ErrorCard title={"Error rendering recent matches"} body={JSON.stringify(error)} />;
  }

  if (!playerMatchesData || !profileID) {
    return (
      <ErrorCard
        title={"Error rendering recent matches"}
        body={"Missing playerMatchesData or profileID"}
      />
    );
  }

  const handleFilterChange = (column: string, filter: string | number) => {
    const updatedFilters = cloneDeep(filters);
    updatedFilters[column][filter].checked = !updatedFilters[column][filter].checked;
    setFilters(updatedFilters);
  };

  const handleFilterReset = (column: string) => {
    const updatedFilters = cloneDeep(filters);
    Object.values(updatedFilters[column]).forEach((filter) => (filter.checked = true));
    setFilters(updatedFilters);
  };

  return (
    <>
      <DataTable
        withBorder
        borderRadius="md"
        highlightOnHover
        striped
        verticalSpacing="sm"
        minHeight={300}
        // provide data
        records={sortedData}
        // define columns
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          {
            accessor: "Played",
            sortable: true,
            textAlignment: "center",
            width: 120,
            render: (record) => {
              const player = getPlayerMatchHistoryResult(record, profileID);
              return (
                <>
                  <div>
                    <FactionIcon name={raceIDs[player?.race_id as raceID]} width={50} />
                  </div>
                  <DynamicTimeAgo timestamp={record.completiontime} />
                </>
              );
            },
          },
          {
            accessor: "result",
            title: (
              <FilterableHeader
                title="Result"
                options={filters.result}
                onChange={(filter) => handleFilterChange("result", filter)}
                onReset={() => handleFilterReset("result")}
              />
            ),
            textAlignment: "center",
            render: (record) => {
              if (isPlayerVictorious(record, profileID)) {
                return (
                  <Badge color={"blue"} variant="filled">
                    VICTORY
                  </Badge>
                );
              } else {
                return (
                  <Badge color={"red"} variant="filled">
                    DEFEAT
                  </Badge>
                );
              }
            },
          },
          {
            accessor: "axis_players",
            title: "Axis Players",
            titleStyle: { textAlign: "left" },
            textAlignment: "center",
            width: "50%",
            render: (record) => {
              const axisPlayers = getMatchPlayersByFaction(
                record.matchhistoryreportresults,
                "axis",
              );
              return <RenderPlayers playerReports={axisPlayers} profileID={profileID} />;
            },
          },
          {
            accessor: "allies_players",
            title: "Allies Players",
            titleStyle: { textAlign: "left" },
            textAlignment: "center",
            width: "50%",
            render: (record) => {
              const alliesPlayers = getMatchPlayersByFaction(
                record.matchhistoryreportresults,
                "allies",
              );
              return <RenderPlayers playerReports={alliesPlayers} profileID={profileID} />;
            },
          },
          {
            accessor: "mapname",
            title: (
              <FilterableHeader
                title="Map"
                options={filters.map}
                onChange={(filter) => handleFilterChange("map", filter)}
                onReset={() => handleFilterReset("map")}
              />
            ),
            // sortable: true,
            textAlignment: "center",
            render: (record) => {
              return <RenderMap mapName={record.mapname} />;
            },
          },
          {
            title: (
              <FilterableHeader
                title="Mode"
                options={filters.mode}
                onChange={(filter) => handleFilterChange("mode", filter)}
                onReset={() => handleFilterReset("mode")}
              />
            ),
            accessor: "matchtype_id",
            // sortable: true,
            textAlignment: "center",
            render: ({ matchtype_id }) => {
              const matchType =
                matchTypesAsObject[matchtype_id]["localizedName"] ||
                matchTypesAsObject[matchtype_id]["name"] ||
                "unknown";
              return <div style={{ whiteSpace: "nowrap" }}>{matchType.toLowerCase()}</div>;
            },
          },
          {
            title: "Match duration",
            accessor: "match_duration",
            sortable: true,
            textAlignment: "center",
            render: ({ startgametime, completiontime }) => {
              return <p>{getMatchDuration(startgametime, completiontime)}</p>;
            },
          },
          {
            title: "Debug",
            accessor: "debug",
            hidden: true,
            render: (record) => {
              return (
                <>
                  {" "}
                  <Button
                    onClick={() => {
                      console.log("Debug selected match");
                      console.log(record);
                    }}
                  >
                    D
                  </Button>
                </>
              );
            },
          },
        ]}
      />
      <Group position={"apart"}>
        <Text size={"sm"} style={{ paddingLeft: 5 }}>
          Data provided by Relic
        </Text>
        <Group spacing={5} position={"right"} style={{ paddingRight: 5 }}>
          <IconInfoCircle size={18} />
          <Text size={"sm"}>Relic keeps only last 10 matches for each mode</Text>
        </Group>
      </Group>
    </>
  );
};

export default PlayerRecentMatches;
