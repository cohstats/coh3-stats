import Link from "next/link";
import {
  Badge,
  Anchor,
  Text,
  Group,
  Button,
  Container,
  Image,
  Card,
  Center,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import React from "react";
import { maps, matchTypesAsObject, raceIDs } from "../../src/coh3/coh3-data";
import { raceID } from "../../src/coh3/coh3-types";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";
import ErrorCard from "../error-card";
import FactionIcon from "../../pages/faction-icon";
import { formatMatchTime } from "../../src/utils";
import { IconInfoCircle } from "@tabler/icons";

const PlayerRecentMatches = ({
  profileID,
  playerMatchesData,
  error,
}: {
  profileID: string;
  playerMatchesData: Array<any>;
  error: string;
}) => {
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

  const renderMap = (name: any) => {
    return (
      <Card style={{ background: "none" }}>
        <Card.Section>
          <Center>
            <Image src={maps[name]?.url} width={160} />
          </Center>
        </Card.Section>
        <Text align="center">{maps[name]?.name}</Text>
      </Card>
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
            ratingChange > 0 ? (
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
        records={playerMatchesData}
        // define columns
        columns={[
          {
            accessor: "Played",
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
            title: "Result",
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
            title: "Map",
            // sortable: true,
            textAlignment: "center",
            render: (record) => {
              return <>{renderMap(record.mapname)}</>;
            },
          },
          {
            title: "Mode",
            accessor: "matchtype_id",
            // sortable: true,
            textAlignment: "center",
            render: ({ matchtype_id }) => {
              const matchType =
                matchTypesAsObject[matchtype_id]["localizedName"] ||
                matchTypesAsObject[matchtype_id]["name"] ||
                "unknown";
              return <>{matchType.toLowerCase()}</>;
            },
          },
          {
            title: "Match duration",
            accessor: "match_duration",
            // sortable: true,
            textAlignment: "center",
            render: ({
              startgametime,
              completiontime,
            }: {
              startgametime: number;
              completiontime: number;
            }) => {
              return <p>{getMatchDuration(startgametime, completiontime)}</p>;
            },
          },
          {
            title: "Debug",
            accessor: "debug",
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
        // sortStatus={sortStatus}
        // onSortStatusChange={setSortStatus}
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
