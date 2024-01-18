import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { Anchor, Card, Group, Title, Tooltip } from "@mantine/core";
import React from "react";
import { DataTable } from "mantine-datatable";
import Link from "next/link";
import EllipsisText from "../../../../components/other/ellipsis-text";
import HelperIcon from "../../../../components/icon/helper";

const NemesisWidget = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  return (
    <div>
      <Card padding="sm" radius="md" withBorder style={{ overflow: "visible" }}>
        <Card.Section>
          <Group m="xs" position="apart">
            <Title order={4}>Top 10 - 1v1 Nemesis</Title>
            <HelperIcon
              text={
                "Nemesis counter has be to 'triggered' by playing the same player 2 times in 1 day (UTC timezone)." +
                " After the trigger, all 1v1 games with that player are counted." +
                " Aliases are saved from the last game played with that player." +
                " Only Steam players are tracked."
              }
              iconSize={23}
            />
          </Group>
        </Card.Section>
        <DataTable
          minHeight={150}
          noRecordsText="No 1v1 nemesis tracked"
          withBorder={false}
          // borderRadius="md"
          // striped={true}
          // @ts-ignore
          columns={[
            {
              accessor: "alias",
              textAlignment: "left",
              title: "Alias",
              width: 100,
              render: ({ alias, profile_id }) => {
                return (
                  <Anchor
                    rel={"noreferrer"}
                    key={profile_id}
                    component={Link}
                    href={`/players/${profile_id}`}
                  >
                    <Tooltip label={alias}>
                      <EllipsisText text={alias} noWrap={false} maxWidth={"12ch"} />
                    </Tooltip>
                  </Anchor>
                );
              },
            },
            {
              accessor: "w",
              textAlignment: "center",
              title: "Wins",
            },
            {
              accessor: "l",
              textAlignment: "center",
              title: "Losses",
            },
            {
              accessor: "wl",
              textAlignment: "center",
              title: "Ratio",
              render: ({ w, l }) => {
                const winrate = (w / (w + l)) * 100;
                return winrate.toFixed(0) + "%";
              },
            },
          ]}
          records={playerStatsData?.nemesis.slice(0, 10)}
          idAccessor={"profile_id"}
        />
      </Card>
    </div>
  );
};

export default NemesisWidget;
