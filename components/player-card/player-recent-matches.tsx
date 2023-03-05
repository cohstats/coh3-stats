import Link from "next/link";
import { Badge, Anchor, Text, Group, Button } from "@mantine/core";
import Image from "next/image";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React from "react";
import { maps, matchTypesAsObject, raceIDs } from "../../src/coh3/coh3-data";
import { MatchHistory, raceID } from "../../src/coh3/coh3-types";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";
import ErrorCard from "../error-card";
import FactionIcon from "../faction-icon";
import { formatMatchTime } from "../../src/utils";
import { IconInfoCircle } from "@tabler/icons";
import sortBy from "lodash/sortBy";
import config from "../../config";
import FilterableHeader from "./filterable-header";

const PlayerRecentMatches = ({
  profileID,
  playerMatchesData,
  error,
}: {
  profileID: string;
  playerMatchesData: Array<MatchHistory>;
  error: string;
}) => {
  const [sortStatus, setSortStatus] = React.useState<DataTableSortStatus>({
    columnAccessor: "Played",
    direction: "asc",
  });
  const [sortedData, setSortedData] = React.useState(sortBy(playerMatchesData, "Played"));
  const [filters, setFilters] = React.useState({
    result: [],
    map: [],
    mode: [],
  });

  const sortedData = React.useMemo(() => {
    const resortedData = sortBy(
      playerMatchesData,
      sortStatus.columnAccessor === "match_duration"
        ? (matchData) => {
            return matchData.startgametime - matchData.completiontime;
          }
        : sortStatus.columnAccessor,
    );
    return sortStatus.direction === "desc" ? resortedData.reverse() : resortedData;
  }, [sortStatus, playerMatchesData]);

  React.useEffect(() => {
    const mapNameSet = new Set<string>();
    const mapTypeIdSet = new Set<string>();
    playerMatchesData.forEach((record) => {
      console.log("map", record.mapname);
      mapNameSet.add(record.mapname);
    });
    const updatedFilters = {
      result: [
        { label: "victory", checked: true, filter: "victory" },
        { label: "defeat", checked: true, filter: "defeat" },
      ],
      map: Array.from(mapNameSet).map((mapname) => {
        return { label: mapname, checked: true, filter: mapname };
      }),
      mode: [],
    };
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

  const isPlayerVictorious = (matchRecord: any): boolean => {
    if (!matchRecord) return false;

    const playerResult = getPlayerMatchHistoryResult(matchRecord);
    return playerResult.resulttype === 1;
  };

  const getPlayerMatchHistoryResult = (matchRecord: any) => {
    for (const record of matchRecord.matchhistoryreportresults) {
      if (`${record.profile_id}` === `${profileID}`) {
        return record;
      }
    }

    return matchRecord.matchhistoryreportresults[0];
  };

  const renderMap = (name: string) => {
    // In case we don't track the map, eg custom maps
    if (!maps[name]) {
      return (
        <div>
          <Text align="center" style={{ whiteSpace: "nowrap" }}>
            {name}
          </Text>
        </div>
      );
    }

    return (
      <div>
        <Image src={maps[name]?.url} width={60} height={60} alt={name} loading="lazy" />
        <Text align="center" style={{ whiteSpace: "nowrap" }}>
          {maps[name]?.name}
        </Text>
      </div>
    );
  };

  const renderPlayers = (arrayOfPlayerReports: Array<any>, matchHistoryMember: Array<any>) => {
    return (
      <>
        {arrayOfPlayerReports.map((playerInfo: Record<string, any>) => {
          const matchHistory = matchHistoryMember.find(
            (e) => e.profile_id === playerInfo.profile_id,
          );
          const ratingPlayedWith = matchHistory.oldrating;
          const ratingChange = matchHistory.newrating - matchHistory.oldrating;
          const ratingChangeAsElement =
            ratingChange >= 0 ? (
              <Text color={"green"}>+{ratingChange}</Text>
            ) : (
              <Text color={"red"}>{ratingChange}</Text>
            );

          return (
            <div key={playerInfo.profile_id}>
              <Group spacing={"xs"}>
                <FactionIcon name={raceIDs[playerInfo?.race_id as raceID]} width={20} />
                <>
                  {" "}
                  {ratingPlayedWith} {ratingChangeAsElement}
                </>
                <Anchor
                  key={playerInfo.profile_id}
                  component={Link}
                  href={`/players/${playerInfo.profile_id}`}
                >
                  {`${playerInfo.profile_id}` === `${profileID}` ? (
                    <Text fw={700}>{playerInfo.profile["alias"]}</Text>
                  ) : (
                    <Text>{playerInfo.profile["alias"]}</Text>
                  )}
                </Anchor>
              </Group>
            </div>
          );
        })}
      </>
    );
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
              const player = getPlayerMatchHistoryResult(record);
              return (
                <>
                  <div>
                    <FactionIcon name={raceIDs[player?.race_id as raceID]} width={50} />
                  </div>
                  <Text size={"xs"}> {formatMatchTime(record.completiontime)}</Text>
                </>
              );
            },
          },
          {
            accessor: "result",
            title: <FilterableHeader title="Result" options={filters.result} />,
            textAlignment: "center",
            render: (record) => {
              if (isPlayerVictorious(record)) {
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
              return renderPlayers(axisPlayers, record.matchhistorymember);
            },
          },
          {
            accessor: "allies_players",
            title: "Allies Players",
            titleStyle: { textAlign: "left" },
            textAlignment: "center",
            width: "50%",
            render: (record) => {
              const axisPlayers = getMatchPlayersByFaction(
                record.matchhistoryreportresults,
                "allies",
              );
              return renderPlayers(axisPlayers, record.matchhistorymember);
            },
          },
          {
            accessor: "mapname",
            title: <FilterableHeader title="Map" options={filters.map} />,
            // sortable: true,
            textAlignment: "center",
            render: (record) => {
              return <>{renderMap(record.mapname)}</>;
            },
          },
          {
            title: <FilterableHeader title="Mode" options={filters.mode} />,
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
            hidden: !config.isDevEnv(),
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
        <Text size={"sm"}>Data provided by Relic</Text>
        <Group spacing={5} position={"right"}>
          <IconInfoCircle size={18} />
          <Text size={"sm"}>Relic keeps only last 10 matches for each mode</Text>
        </Group>
      </Group>
    </>
  );
};

export default PlayerRecentMatches;
