"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { PlayerReport } from "../src/coh3/coh3-types";
import { Box, Flex, Text, Image, Group } from "@mantine/core";
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

  const tableStyles = {
    header: {
      backgroundColor: "white",
      color: "black",
    },
    table: {
      "& tbody tr": {
        borderBottom: "1px solid white",
      },
    },
  };

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
        styles={tableStyles}
      />
    </>
  );
};

interface ExpandedRowContentProps {
  record: PlayerReport;
}

const ExpandedRowContent = ({}: ExpandedRowContentProps) => {
  const commanders = [
    {
      name: "Special Operations Doctrine",
      image: "/images/commander-1.png",
      items: [
        { name: "Infiltration Grenades", image: "/images/commander-item-1.png" },
        { name: "Sabotage", image: "/images/commander-item-1.png" },
        { name: "Commando Raid", image: "/images/commander-item-1.png" },
      ],
    },
    {
      name: "Armored Assault Doctrine",
      image: "/images/commander-1.png",
      items: [
        { name: "Panzer IV Command Tank", image: "/images/commander-item-1.png" },
        { name: "Mechanized Assault Group", image: "/images/commander-item-1.png" },
        { name: "Tiger Tank", image: "/images/commander-item-1.png" },
      ],
    },
    {
      name: "Luftwaffe Ground Forces",
      image: "/images/commander-1.png",
      items: [
        { name: "Stuka Close Air Support", image: "/images/commander-item-1.png" },
        { name: "88mm Flak 36", image: "/images/commander-item-1.png" },
        { name: "Fallschirmjäger Drop", image: "/images/commander-item-1.png" },
      ],
    },
  ];
  const bulletins = [
    {
      name: "Recruit Training: Infantry",
      description: "Riflemen and Volksgrenadiers have 3% increased accuracy",
      image: "/images/bulletin-1.png",
    },
    {
      name: "Officer Training: Infantry",
      description: "Riflemen and Volksgrenadiers reload 3% faster.",
      image: "/images/bulletin-1.png",
    },
    {
      name: "Veteran Training: Infantry",
      description:
        "Riflemen and Volksgrenadiers rifles cooldown 2% faster between shots and reload 2% faster.",
      image: "/images/bulletin-1.png",
    },
  ];

  return (
    <Flex p="md" gap={10}>
      <div>
        {commanders.map((commander, index) => (
          <Box key={index} mb="sm">
            <Flex gap={15}>
              <Image w={80} h={80} src={commander.image} alt={commander.name} />
              <Box>
                <Text>{commander.name}</Text>
                <Flex gap="xs" mt="xs">
                  {commander.items.map((item, itemIndex) => (
                    <Image
                      key={itemIndex}
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                    />
                  ))}
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </div>

      <div>
        {bulletins.map((bulletin, index) => (
          <Flex gap={8} key={index} mb="xs">
            <Image w={80} h={80} src={bulletin.image} alt={bulletin.name} />
            <Box>
              <Text>{bulletin.name}</Text>
              <Text size="sm">{bulletin.description}</Text>
            </Box>
          </Flex>
        ))}
      </div>
    </Flex>
  );
};

export default PlayerMatchesDataTable;
