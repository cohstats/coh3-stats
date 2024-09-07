import {
  InternalStandings,
  leaderBoardType,
  leaderBoardTypeArray,
  ProcessedCOHPlayerStats,
  raceTypeArray,
} from "../../../../../src/coh3/coh3-types";
import { Card, Group, Title, Tooltip, Flex, Button } from "@mantine/core";
import React from "react";
import { DataTable } from "mantine-datatable";
import EllipsisText from "../../../../../components/other/ellipsis-text";
import HelperIcon from "../../../../../components/icon/helper";

import { getMapLocalizedName } from "../../../../../src/coh3/helpers";
import { localizedGameTypes } from "../../../../../src/coh3/coh3-data";

import classes from "../../Players.module.css";

const MapsWidget = ({
  playerStatsData,
  playerStandings,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  playerStandings: InternalStandings;
}) => {
  const typeWithMostGames = React.useMemo(() => {
    type DataValues = Record<leaderBoardType, number>;
    const dataValues: DataValues = {
      "1v1": 0,
      "2v2": 0,
      "3v3": 0,
      "4v4": 0,
    };

    for (const faction of Object.values(playerStandings)) {
      leaderBoardTypeArray.forEach((gameType) => {
        const gameData = faction[gameType];
        if (gameData) {
          dataValues[gameType] += gameData.wins + gameData.losses;
        }
      });
    }

    return Object.entries(dataValues).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [playerStandings]);

  const [selectedType, setSelectedType] = React.useState<"1v1" | "2v2" | "3v3" | "4v4">(
    (typeWithMostGames as "1v1" | "2v2" | "3v3" | "4v4") || "1v1",
  );

  const mapsData = raceTypeArray.reduce(
    (acc, faction) => {
      const factionData = playerStatsData?.statGroups?.[selectedType]?.[faction]?.maps;
      if (factionData) {
        for (const [key, value] of Object.entries(factionData)) {
          if (acc[key]) {
            acc[key].w += value.w;
            acc[key].l += value.l;
          } else {
            acc[key] = { ...value };
          }
        }
      }
      return acc;
    },
    {} as {
      [key: string]: {
        w: number;
        l: number;
      };
    },
  );

  const tableData = Object.entries(mapsData || {}).map(([key, value]) => {
    return {
      mapName: key,
      w: value.w,
      l: value.l,
    };
  });

  return (
    <div>
      <Card padding="sm" radius="md" withBorder style={{ overflow: "visible" }}>
        <Card.Section>
          <Group m="xs" justify="space-between">
            <Title order={4}>Maps Winrate {localizedGameTypes[selectedType]}</Title>
            <HelperIcon text={"Across all factions."} width={150} iconSize={23} />
          </Group>
        </Card.Section>

        <DataTable
          minHeight={250}
          records={tableData}
          noRecordsText="No maps data tracked"
          // borderRadius="md"
          // striped={true}
          // @ts-ignore
          columns={[
            {
              accessor: "mapName",
              textAlign: "left",
              title: "Map",
              width: 95,
              render: ({ mapName }) => {
                const localizedMapName = getMapLocalizedName(mapName);

                return (
                  <Tooltip label={localizedMapName}>
                    <EllipsisText text={localizedMapName} noWrap={false} maxWidth={"12ch"} />
                  </Tooltip>
                );
              },
            },
            {
              accessor: "w",
              textAlign: "center",
              title: "Wins",
            },
            {
              accessor: "l",
              textAlign: "center",
              title: "Losses",
            },
            {
              accessor: "wl",
              textAlign: "center",
              title: "Ratio",
              render: ({ w, l }) => {
                const winRate = (w / (w + l)) * 100;
                return winRate.toFixed(0) + "%";
              },
            },
          ]}
          idAccessor={"mapName"}
        />
        <Flex justify={"center"} pt={"xs"}>
          <Button.Group>
            <Button
              variant="default"
              size={"compact-sm"}
              className={classes.mapsWidgetButton}
              onClick={() => setSelectedType("1v1")}
            >
              1 vs 1
            </Button>
            <Button
              variant="default"
              size={"compact-sm"}
              onClick={() => setSelectedType("2v2")}
              className={classes.mapsWidgetButton}
            >
              2 vs 2
            </Button>
            <Button
              variant="default"
              size={"compact-sm"}
              onClick={() => setSelectedType("3v3")}
              className={classes.mapsWidgetButton}
            >
              3 vs 3
            </Button>
            <Button
              variant="default"
              size={"compact-sm"}
              onClick={() => setSelectedType("4v4")}
              className={classes.mapsWidgetButton}
            >
              4 vs 4
            </Button>
          </Button.Group>
        </Flex>
      </Card>
    </div>
  );
};

export default MapsWidget;
