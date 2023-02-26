import { calculatePageNumber } from "../../src/utils";
import Link from "next/link";
import { Badge, Anchor, Text, Group } from "@mantine/core";
import CountryFlag from "../country-flag";
import { DataTable } from "mantine-datatable";
import React from "react";
import { localizedNames, matchTypesAsObject, raceIDs } from "../../src/coh3/coh3-data";
import { raceID } from "../../src/coh3/coh3-types";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";

const PlayerRecentMatches = ({
  profileID,
  playerMatchesData,
  error,
}: {
  profileID: string;
  playerMatchesData: Array<any>;
  error: string;
}) => {
  console.log("WTF?", playerMatchesData, profileID);
  if (!playerMatchesData || !profileID) {
    return <></>;
  }

  console.log(profileID);
  console.log(playerMatchesData);
  console.log(error);

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
                {localizedNames[raceIDs[playerInfo?.race_id as raceID]].substring(0, 1)}
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
        records={playerMatchesData || []}
        // define columns
        columns={[
          {
            accessor: "Played",
            textAlignment: "center",
            render: (record) => {
              const player = getPlayerMatchHistoryResult(record);
              // TODO: Add faction icon
              return <>{localizedNames[raceIDs[player?.race_id as raceID]]}</>;
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
            // sortable: true,
            textAlignment: "left",
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
        ]}
        // sortStatus={sortStatus}
        // onSortStatusChange={setSortStatus}
      />
    </>
  );
};

export default PlayerRecentMatches;
