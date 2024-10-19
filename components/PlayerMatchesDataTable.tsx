import { useState } from "react";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { PlayerReport } from "../src/coh3/coh3-types";
import { Text, Group } from "@mantine/core";
import { IconBulb } from "@tabler/icons-react";

const parseCounters = (counter: string, key: string) => {
  try {
    const counters = JSON.parse(counter);
    return counters[key] !== undefined ? counters[key] : "N/A";
  } catch (error) {
    return "N/A";
  }
};

interface PlayerMatchesDataTableProps {
  data: PlayerReport[];
  isWinner: boolean;
}

const PlayerMatchesDataTable = ({ data, isWinner }: PlayerMatchesDataTableProps) => {
  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);

  const columns: DataTableColumn<PlayerReport>[] = [
    {
      accessor: "playerName",
      title: "Player",
      width: 200,
      render: (record) => <Text>{record.profile.alias}</Text>,
    },
    {
      accessor: "dmgdone",
      title: "Damage Dealt",
      render: (record) => parseCounters(record.counters, "dmgdone"),
    },
    {
      accessor: "ekills",
      title: "Units Killed",
      render: (record) => parseCounters(record.counters, "ekills"),
    },
    {
      accessor: "edeaths",
      title: "Units Lost",
      render: (record) => parseCounters(record.counters, "edeaths"),
    },
    {
      accessor: "kd_ratio",
      title: "K/D",
      render: (record) => {
        const kills = parseCounters(record.counters, "ekills");
        const deaths = parseCounters(record.counters, "edeaths");
        return deaths !== "0" ? (Number(kills) / Number(deaths)).toFixed(2) : "N/A";
      },
    },
    {
      accessor: "sqkilled",
      title: "Squads Killed",
      render: (record) => parseCounters(record.counters, "sqkilled"),
    },
    {
      accessor: "sqprod",
      title: "Squads Made / Lost",
      render: (record) =>
        `${parseCounters(record.counters, "sqprod")} / ${parseCounters(record.counters, "sqlost")}`,
    },
    {
      accessor: "vkill",
      title: "Vehicles Killed",
      render: (record) => parseCounters(record.counters, "vkill"),
    },
    {
      accessor: "vprod",
      title: "Vehicles Prod / Lost",
      render: (record) =>
        `${parseCounters(record.counters, "vprod")} / ${parseCounters(record.counters, "vlost")}`,
    },
    {
      accessor: "pcap",
      title: "Points Captured / Lost",
      render: (record) =>
        `${parseCounters(record.counters, "pcap")} / ${parseCounters(record.counters, "plost")}`,
    },
    {
      accessor: "precap",
      title: "Points Recaptured",
      render: (record) => parseCounters(record.counters, "precap"),
    },
    {
      accessor: "abil",
      title: "Commander Abilities used",
      render: (record) => parseCounters(record.counters, "abil"),
    },
  ];

  return (
    <>
      <Group align="center" mt="xs">
        <IconBulb size={20} />
        <Text size="sm">Click on a row to show player's Commanders and Bulletins</Text>
      </Group>
      <DataTable
        highlightOnHover
        records={[...data]}
        columns={columns}
        rowExpansion={{
          content: ({ record }) => <ExpandedRowContent record={record} />,
          allowMultiple: true,
          expanded: {
            recordIds: expandedRecordIds,
            onRecordIdsChange: setExpandedRecordIds,
          },
        }}
        rowStyle={() => ({
          backgroundColor: isWinner ? "#D1E4D0" : "#E4D0D1",
          color: "black",
        })}
        onRowClick={({ record }) => {
          setExpandedRecordIds((currentIds) =>
            currentIds.includes(record.profile.alias)
              ? currentIds.filter((id) => id !== record.profile.alias)
              : [...currentIds, record.profile.alias],
          );
        }}
      />
    </>
  );
};

interface ExpandedRowContentProps {
  record: PlayerReport;
}

const ExpandedRowContent = ({}: ExpandedRowContentProps) => {
  return <></>;
};

export default PlayerMatchesDataTable;
