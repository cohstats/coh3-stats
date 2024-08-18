import {
  getCOHDBReplaysURL,
  getCOHDBUploadULR,
  ProcessedReplayData,
  RECORDS_PER_REPLAYS_PAGE,
} from "../../../src/apis/cohdb-api";
import ErrorCard from "../../../components/error-card";
import React from "react";
import { DataTable } from "mantine-datatable";
import FactionIcon from "../../../components/faction-icon";
import { cohDBracesToNormalRaces } from "../../../src/coh3/coh3-data";
import { Anchor, Button, Flex, Group, Title, Tooltip, Text, Space, Stack } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCloudUpload,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";
import config from "../../../config";
import { calculatePageNumber, calculatePositionNumber } from "../../../src/utils";
import { useRouter } from "next/router";
import { getDesktopAppRoute, getPlayerCardRoute } from "../../../src/routes";
import dayjs from "dayjs";
import Link from "next/link";
import EllipsisText from "../../../components/other/ellipsis-text";
import RenderMap from "./components/matches-table/render-map";

const ReplaysTab = ({
  profileID,
  replaysData,
  error,
}: {
  profileID: string;
  replaysData: ProcessedReplayData;
  error: string;
}) => {
  const { push, query } = useRouter();
  const { start } = query;

  const queryStart = parseInt(start as string) || 0;

  const onPageChange = (p: number) => {
    // -1 because we start from 0 not from 1
    const startPositionNumber = calculatePositionNumber(p, RECORDS_PER_REPLAYS_PAGE) - 1;
    push({ query: { ...query, start: startPositionNumber } }, undefined);
  };

  if (error || !replaysData) {
    return (
      <ErrorCard
        title={"Error getting the replays"}
        body={`There was an error getting the replays: ${error}`}
      />
    );
  }

  return (
    <>
      <Group justify="space-between">
        <Title order={3}>Replays by COHDB</Title>
        <Group>
          <Anchor href={getCOHDBUploadULR()} target="_blank">
            <Button leftSection={<IconUpload />}>Upload Replay</Button>
          </Anchor>
          <Tooltip label={"You can automatically upload all your replays with Desktop App"}>
            <Anchor href={getDesktopAppRoute()}>
              <Button leftSection={<IconCloudUpload />}>Auto sync Replays</Button>
            </Anchor>
          </Tooltip>
        </Group>
      </Group>
      <Space h={"md"} />
      <DataTable
        minHeight={300}
        withTableBorder
        borderRadius="md"
        highlightOnHover
        striped
        verticalSpacing="xs"
        idAccessor={"id"}
        records={replaysData.data}
        totalRecords={replaysData.replaysTotal}
        recordsPerPage={RECORDS_PER_REPLAYS_PAGE}
        // we need to do +1 because we start from 0 not from 1
        page={calculatePageNumber(queryStart + 1, RECORDS_PER_REPLAYS_PAGE)}
        onPageChange={onPageChange}
        columns={[
          {
            accessor: "Played",
            textAlign: "center",
            width: 80,
            render: (record) => {
              const PlayerRecord = record.players.find(
                (player) => `${player.profile_id}` === profileID,
              );
              const playerRaceName = cohDBracesToNormalRaces[PlayerRecord?.faction as string];

              return (
                <Tooltip label={`Played on ${record.recorded_at}`}>
                  <div>
                    <FactionIcon name={playerRaceName || "dak"} width={50} />
                  </div>
                </Tooltip>
              );
            },
          },
          {
            accessor: "mapname",
            title: "Map",
            // sortable: true,
            textAlign: "center",
            render: (record) => {
              return <RenderMap mapName={record.map_id} renderTitle={false} />;
            },
          },
          {
            accessor: "axis_players",
            title: "Axis Players",
            render: ({ players }) => {
              // see cohDBracesToNormalRaces in src/coh3/coh3-data.ts
              const axisPlayers = players.filter(
                (player) => player.faction === "afrika_korps" || player.faction === "germans",
              );

              return (
                <>
                  {axisPlayers.map((player) => {
                    const playerRaceName = cohDBracesToNormalRaces[player.faction as string];
                    return (
                      <div key={player.profile_id}>
                        <Group gap={"xs"}>
                          <FactionIcon name={playerRaceName} width={20} />
                          <Anchor
                            rel={"noreferrer"}
                            key={player.profile_id}
                            component={Link}
                            href={`/players/${player.profile_id}`}
                          >
                            {`${player.profile_id}` === `${profileID}` ? (
                              <Text span fw={700}>
                                <EllipsisText text={player.name} maxWidth={"13ch"} />
                              </Text>
                            ) : (
                              <Text span>
                                <EllipsisText text={player.name} maxWidth={"13ch"} />
                              </Text>
                            )}
                          </Anchor>
                        </Group>
                      </div>
                    );
                  })}
                </>
              );
            },
          },
          {
            accessor: "allies_players",
            title: "Allies Players",
            render: ({ players }) => {
              // see cohDBracesToNormalRaces in src/coh3/coh3-data.ts
              const alliesPlayers = players.filter(
                (player) => player.faction === "americans" || player.faction === "british_africa",
              );

              return (
                <>
                  {alliesPlayers.map((player) => {
                    const playerRaceName = cohDBracesToNormalRaces[player.faction as string];
                    return (
                      <div key={player.profile_id}>
                        <Group gap={"xs"}>
                          <FactionIcon name={playerRaceName} width={20} />
                          <Anchor
                            rel={"noreferrer"}
                            key={player.profile_id}
                            component={Link}
                            href={`/players/${player.profile_id}`}
                          >
                            {`${player.profile_id}` === `${profileID}` ? (
                              <Text span fw={700}>
                                <EllipsisText text={player.name} maxWidth={"13ch"} />
                              </Text>
                            ) : (
                              <Text span>
                                <EllipsisText text={player.name} maxWidth={"13ch"} />
                              </Text>
                            )}
                          </Anchor>
                        </Group>
                      </div>
                    );
                  })}
                </>
              );
            },
          },
          {
            accessor: "title",
            title: "Title",
            // cellsStyle: { display: "flex" },
            // textAlign: "left",
            // width: "70%",
            render: ({ title, uploaded_at, uploaded_by }) => {
              return (
                <div style={{ paddingTop: 5 }}>
                  <Title order={4}>{title}</Title>
                  <Text span inherit c="dimmed">
                    Uploaded by{" "}
                    <Anchor href={getPlayerCardRoute(uploaded_by.profile_id)}>
                      {uploaded_by.name}
                    </Anchor>{" "}
                    on {dayjs(uploaded_at).format("YYYY-MM-DD HH:mm")} UTC
                  </Text>
                </div>
              );
            },
          },
          {
            accessor: "length",
            title: "Duration",
            render: ({ length }) => {
              // format seconds to HH:MM:SS
              const formatTime = (seconds: number) =>
                isNaN(seconds) || seconds < 0
                  ? "Invalid time"
                  : [
                      Math.floor(seconds / 3600),
                      Math.floor((seconds % 3600) / 60),
                      Math.floor(seconds % 60),
                    ]
                      .map((unit) => (unit < 10 ? `0${unit}` : `${unit}`))
                      .join(":");

              return (
                <Text span inherit>
                  {formatTime(length)}
                </Text>
              );
            },
          },
          {
            accessor: "patch",
            title: "Patch",
            width: 75,
            render: ({ patch }) => {
              if (config.latestPatch === patch) {
                return <span>{patch}</span>;
              } else {
                return (
                  <Tooltip
                    label={`This replay was not played on latest patch ${config.latestPatch} you might not be able to play it.`}
                    color="orange"
                    withArrow
                    position={"bottom"}
                    multiline
                    w={280}
                  >
                    <Flex
                      gap="xs"
                      justify="flex-start"
                      align="center"
                      direction="row"
                      wrap={"nowrap"}
                    >
                      {patch}
                      <IconAlertTriangle size={16} />{" "}
                    </Flex>
                  </Tooltip>
                );
              }
            },
          },
          {
            accessor: "downloads_count",
            title: "",
            width: 110,
            render: ({ downloads_count, id }) => {
              return (
                <Stack gap={"xs"}>
                  <Anchor href={getCOHDBReplaysURL(id)} target="_blank">
                    <Button w={90}>Details</Button>
                  </Anchor>
                  <Anchor href={getCOHDBReplaysURL(id)} target="_blank">
                    <Button w={90} leftSection={<IconDownload />}>
                      {downloads_count}
                    </Button>
                  </Anchor>
                </Stack>
              );
            },
          },
        ]}
      />
    </>
  );
};

export default ReplaysTab;
