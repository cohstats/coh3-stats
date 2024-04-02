import { Badge, Text, Group, Button, Switch, Stack, Space, Tooltip, Center } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React from "react";
import { isOfficialMap, maps, matchTypesAsObject, raceIDs } from "../../../src/coh3/coh3-data";
import { ProcessedMatch, raceID } from "../../../src/coh3/coh3-types";
import { getMatchDuration, getMatchPlayersByFaction } from "../../../src/coh3/helpers";
import ErrorCard from "../../../components/error-card";
import FactionIcon from "../../../components/faction-icon";
import { IconInfoCircle } from "@tabler/icons-react";
import sortBy from "lodash/sortBy";
import cloneDeep from "lodash/cloneDeep";
import FilterableHeader from "./filterable-header";
import RenderPlayers from "../../../components/matches-table/render-players";
import RenderMap from "../../../components/matches-table/render-map";
import DynamicTimeAgo from "../../../components/other/dynamic-timeago";
import { getPlayerMatchHistoryResult, isPlayerVictorious } from "../../../src/players/utils";

/**
 * Timeago is causing issues with SSR, move to client side
 */

export type FilterInformation = { label: string; checked: boolean; filter: string | number };

const PlayerRecentMatchesTab = ({
  profileID,
  playerMatchesData,
  error,
  customGamesHidden,
}: {
  profileID: string;
  playerMatchesData: Array<ProcessedMatch>;
  error: string;
  customGamesHidden: boolean | undefined | null;
}) => {
  const [debug, setDebug] = React.useState(false);
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
  }, [sortStatus, playerMatchesData, filters]);

  // populate filters with values actually found in this players recent history
  React.useEffect(() => {
    const mapNameMap: { [key: string]: FilterInformation } = {};
    const matchTypeMap: { [key: number]: FilterInformation } = {};
    playerMatchesData?.forEach(({ mapname, matchtype_id }) => {
      mapNameMap[mapname] = {
        label: isOfficialMap(mapname) ? maps[mapname]?.name : mapname,
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
              const playerResult = getPlayerMatchHistoryResult(record, profileID);
              const ratingChange =
                playerResult?.matchhistorymember?.newrating &&
                playerResult?.matchhistorymember?.oldrating
                  ? playerResult.matchhistorymember.newrating -
                    playerResult.matchhistorymember.oldrating
                  : undefined;

              if (isPlayerVictorious(record, profileID)) {
                return (
                  <Badge color={"blue"} variant="filled" w={"16ch"}>
                    VICTORY +{ratingChange}
                  </Badge>
                );
              } else {
                if (playerResult?.resulttype === 0) {
                  return (
                    <Badge color={"red"} variant="filled" w={"16ch"}>
                      DEFEAT {ratingChange}
                    </Badge>
                  );
                } else if (playerResult?.resulttype === 4) {
                  return (
                    <Badge color={"gray"} variant="filled" w={"14ch"}>
                      DE-SYNC
                    </Badge>
                  );
                } else {
                  return (
                    <Badge color={"gray"} variant="filled" w={"14ch"}>
                      ERROR
                    </Badge>
                  );
                }
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
              return (
                <RenderPlayers
                  playerReports={axisPlayers}
                  profileID={profileID}
                  matchType={record.matchtype_id}
                />
              );
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
              return (
                <RenderPlayers
                  playerReports={alliesPlayers}
                  profileID={profileID}
                  matchType={record.matchtype_id}
                />
              );
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
            hidden: !debug,
            render: (record) => {
              return (
                <>
                  <Tooltip label="Logs the match data into console">
                    <Button
                      onClick={() => {
                        console.log("Debug selected match");
                        console.log(record);
                      }}
                    >
                      D
                    </Button>
                  </Tooltip>
                </>
              );
            },
          },
        ]}
      />
      <Space h={5} />
      <Group
        position={"apart"}
        style={{ alignItems: "flex-start", paddingRight: 5, paddingLeft: 5 }}
      >
        <Text size={"sm"}>Data provided by Relic</Text>
        <Stack align="flex-end" spacing="xs">
          <Group spacing={5} position={"right"}>
            <IconInfoCircle size={18} />
            <Text size={"sm"}>Relic keeps only last 10 matches for each mode</Text>
          </Group>
          <Switch
            label="Enable debug mode"
            size="sm"
            radius="md"
            onChange={(event) => setDebug(event.currentTarget.checked)}
          />
        </Stack>
      </Group>
      {customGamesHidden && (
        <Center>
          <Text size={"sm"} c="dimmed">
            Custom games are hidden for this player. Please contact admin to enable them.
          </Text>
        </Center>
      )}
    </>
  );
};

export default PlayerRecentMatchesTab;
