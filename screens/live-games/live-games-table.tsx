import { LiveGame, ResponseLiveGames, TypeOfLiveGame } from "../../src/coh3/coh3-types";
import { DataTable, DataTableColumn } from "mantine-datatable";

import { matchTypesAsObject } from "../../src/coh3/coh3-data";

import { Flex, Switch, Text } from "@mantine/core";
import { getMatchDuration, getMatchPlayersByFaction } from "../../src/coh3/helpers";
import RenderMap from "../players/tabs/recent-matches-tab/matches-table/render-map";

import React from "react";
import dayjs from "dayjs";
import RenderPlayersLiveGames from "./render-players-live-games";
import { calculatePageNumber } from "../../src/utils";
import { useLocalStorage } from "@mantine/hooks";
import ErrorCard from "../../components/error-card";

const LiveGamesTable = ({
  data,
  loading,
  error,
  recordsPerPage,
  start,
  onPageChange,
  type,
}: {
  data: ResponseLiveGames | null;
  loading: boolean;
  error: string | null;
  recordsPerPage: number;
  start: number;
  onPageChange: (p: number) => void;
  type: TypeOfLiveGame | null;
}) => {
  const [showCountryFlag, setShowCountryFlag] = useLocalStorage({
    key: "show-country-flag-matches",
    defaultValue: "false",
  });

  const [showServer, setShowServer] = useLocalStorage({
    key: "show-server-live-games",
    defaultValue: "false",
  });

  if (error) {
    return <ErrorCard title={"Error getting the live games"} body={`${error}`} />;
  }

  const columns: DataTableColumn<LiveGame>[] = [
    {
      accessor: "matchtype_id",
      title: "Mode",
      textAlign: "center",
      render: ({ matchtype_id }) => {
        return (
          <div style={{ whiteSpace: "nowrap" }}>
            {matchTypesAsObject[matchtype_id as number]["localizedName"] || "unknown"}
          </div>
        );
      },
    },
    {
      accessor: "axis_players",
      title: "Axis Players",
      textAlign: "left",
      width: "50%",
      render: ({ players }) => {
        const filteredPlayers = getMatchPlayersByFaction(players, "axis");

        return (
          <RenderPlayersLiveGames
            playerReports={filteredPlayers}
            renderFlag={showCountryFlag === "true"}
            type={type}
          />
        );
      },
    },
    {
      accessor: "allied_players",
      title: "Allies Players",
      textAlign: "left",
      width: "50%",
      render: ({ players }) => {
        const filteredPlayers = getMatchPlayersByFaction(players, "allies");

        return (
          <RenderPlayersLiveGames
            playerReports={filteredPlayers}
            renderFlag={showCountryFlag === "true"}
            type={type}
          />
        );
      },
    },
    {
      accessor: "mapname",
      title: "Map",
      textAlign: "center",
      render: ({ mapname }) => {
        return <RenderMap mapName={mapname as string} />;
      },
    },
    {
      accessor: "current_observers",
      title: "Observers",
      textAlign: "center",
    },
    {
      accessor: "startgametime",
      title: "Game Time",
      textAlign: "center",
      render: ({ startgametime }) => {
        return <>{getMatchDuration(startgametime as number, dayjs().unix())}</>;
      },
    },
    {
      accessor: "server",
      title: "Server",
      textAlign: "center",
      hidden: showServer !== "true",
    },
  ];

  return (
    <>
      <Flex justify={"right"} pb={"xs"} pt={"md"}>
        <Switch
          checked={showCountryFlag === "true"}
          onChange={(event) => {
            setShowCountryFlag(`${event.currentTarget.checked}`);
          }}
          label="Show Player Flags"
        />
      </Flex>
      <DataTable
        idAccessor={"id"}
        borderRadius="md"
        highlightOnHover
        striped
        withTableBorder
        verticalSpacing="xs"
        minHeight={650}
        records={data?.liveGames || []}
        columns={columns}
        fetching={loading}
        page={calculatePageNumber(start ? start : 1, recordsPerPage)}
        totalRecords={data?.totalGames || 0}
        recordsPerPage={recordsPerPage}
        onPageChange={onPageChange}
      />
      <Flex justify="space-between" align="center" pb="xs" pt="xs" wrap="wrap">
        <div style={{ width: 130 }}></div>
        <Text fs="italic" c="dimmed" fz="sm">
          {data?.unixTimeStamp && (
            <>Data updated on {new Date(data?.unixTimeStamp * 1000 || "").toLocaleString()}</>
          )}
        </Text>
        <Switch
          checked={showServer === "true"}
          onChange={(event) => {
            setShowServer(`${event.currentTarget.checked}`);
          }}
          label="Show Match Server"
        />
      </Flex>
    </>
  );
};

export default LiveGamesTable;
