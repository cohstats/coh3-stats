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
import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation("live-games");
  const [showCountryFlag, setShowCountryFlag] = useLocalStorage({
    key: "show-country-flag-matches",
    defaultValue: "false",
  });

  const [showServer, setShowServer] = useLocalStorage({
    key: "show-server-live-games",
    defaultValue: "false",
  });

  if (error) {
    return <ErrorCard title={t("gamesTable.errors.title")} body={`${error}`} />;
  }

  const columns: DataTableColumn<LiveGame>[] = [
    {
      accessor: "matchtype_id",
      title: t("gamesTable.columns.mode"),
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
      title: t("gamesTable.columns.axisPlayers"),
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
      title: t("gamesTable.columns.alliesPlayers"),
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
      title: t("gamesTable.columns.map"),
      textAlign: "center",
      render: ({ mapname }) => {
        return <RenderMap mapName={mapname as string} />;
      },
    },
    {
      accessor: "current_observers",
      title: t("gamesTable.columns.observers"),
      textAlign: "center",
    },
    {
      accessor: "startgametime",
      title: t("gamesTable.columns.gameTime"),
      textAlign: "center",
      render: ({ startgametime }) => {
        return <>{getMatchDuration(startgametime as number, dayjs().unix())}</>;
      },
    },
    {
      accessor: "server",
      title: t("gamesTable.columns.server"),
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
          label={t("gamesTable.switches.showFlags")}
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
            <>
              {t("gamesTable.dataUpdated", {
                time: new Date(data?.unixTimeStamp * 1000 || "").toLocaleString(),
              })}
            </>
          )}
        </Text>
        <Switch
          checked={showServer === "true"}
          onChange={(event) => {
            setShowServer(`${event.currentTarget.checked}`);
          }}
          label={t("gamesTable.switches.showServer")}
        />
      </Flex>
    </>
  );
};

export default LiveGamesTable;
