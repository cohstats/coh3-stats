import { ProcessedCOHPlayerStats } from "../../../../../src/coh3/coh3-types";
import { Card, Group, Title, Text } from "@mantine/core";
import React from "react";
import HelperIcon from "../../../../../components/icon/helper";
import { DataTable } from "mantine-datatable";
import dayjs from "dayjs";

const AliasHistoryWidget = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  const aliases = playerStatsData?.aliasHistory || [];

  return (
    <div>
      <Card padding="sm" radius="md" withBorder style={{ overflow: "visible" }}>
        <Card.Section>
          <Group m="xs" justify="space-between">
            <Title order={4}>Aliases</Title>
            <HelperIcon
              text="Historical record of alternative names this player has used in matches"
              width={250}
              iconSize={23}
            />
          </Group>
        </Card.Section>

        <DataTable
          minHeight={150}
          noRecordsText="No previous aliases found"
          records={aliases}
          idAccessor={"alias"}
          columns={[
            {
              accessor: "alias",
              title: "Alias",
              width: "60%",
            },
            {
              accessor: "updatedAt",
              title: "Last Used",
              textAlign: "left",
              render: ({ updatedAt }: { updatedAt: number }) => (
                <Text inherit>
                  {updatedAt && !isNaN(updatedAt)
                    ? dayjs.unix(updatedAt).format("YYYY-MM-DD")
                    : "-"}
                </Text>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AliasHistoryWidget;
