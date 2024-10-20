import React from "react";
import { DataTable, DataTableColumnGroup } from "mantine-datatable";
import { PlayerReport } from "../../src/coh3/coh3-types";
import { Group, Image, Badge } from "@mantine/core";

import { getMatchDurationGameTime } from "../../src/coh3/helpers";
import { getIconsPathOnCDN } from "../../src/utils";
import { RenderPlayer } from "../players/tabs/recent-matches-tab/matches-table/render-players";

interface PlayerMatchesDataTableProps {
  data: PlayerReport[];
}

const PlayerMatchesDataTable = ({ data }: PlayerMatchesDataTableProps) => {
  // const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);

  const tableGroups: DataTableColumnGroup<PlayerReport>[] = [
    {
      id: "playergroup",
      textAlign: "center",
      title: (
        <>
          {data[0].resulttype === 1 && (
            <Badge color={"blue"} variant="filled" w={"25ch"}>
              VICTORY
            </Badge>
          )}
          {data[0].resulttype === 0 && (
            <Badge color={"red"} variant="filled" w={"25ch"}>
              DEFEAT
            </Badge>
          )}
          {data[0].resulttype === 4 && (
            <Badge color={"gray"} variant="filled" w={"25ch"}>
              DE-SYNC
            </Badge>
          )}
          {data[0].resulttype !== 1 && data[0].resulttype !== 0 && data[0].resulttype !== 4 && (
            <Badge color={"gray"} variant="filled" w={"25ch"}>
              ERROR
            </Badge>
          )}
        </>
      ),
      // style: {
      //   backgroundColor: isWinner ? "#D1E4D0" : "#E4D0D1",
      //   // color: "black",
      // },
      columns: [
        {
          accessor: "playerName",
          title: <>&nbsp; Faction &nbsp; /&nbsp; ELO&nbsp; /&nbsp; Alias</>,
          width: 250,
          render: (record) => {
            return (
              <RenderPlayer playerInfo={record} profileID={0} matchType={21} renderFlag={false} />
            );
          },
        },
      ],
    },
    {
      id: "dmgdone",
      title: "",
      columns: [
        {
          accessor: "dmgdone",
          title: "Damage Dealt",
          textAlign: "center",
          render: ({ counters }) => counters.dmgdone.toLocaleString(),
        },
        {
          accessor: "kd_ratio",
          title: "K/D",
          textAlign: "center",
          render: ({ counters }) => {
            const kills = counters.ekills;
            const deaths = counters.edeaths;
            return deaths !== 0 ? (kills / deaths).toFixed(2) : kills;
          },
        },
      ],
    },
    {
      id: "units",
      title: (
        <Group gap={4} justify="center">
          <Image
            src={getIconsPathOnCDN(`/icons/races/common/symbols/building_barracks.webp`)}
            alt="Infantry"
            width={20}
            height={20}
          />
          Units
        </Group>
      ),
      textAlign: "center",
      columns: [
        {
          accessor: "ekills",
          title: "Killed",
          textAlign: "center",
          render: ({ counters }) => counters.ekills ?? "N/A",
        },
        {
          accessor: "edeaths",
          title: "Lost",
          textAlign: "center",
          render: ({ counters }) => counters.edeaths ?? "N/A",
        },
      ],
    },

    {
      id: "Squads",
      title: (
        <Group gap={"xs"} justify="center">
          <Image
            src={getIconsPathOnCDN("/icons/common/squad/squad.webp")}
            alt="Infantry"
            width={20}
            height={20}
          />
          Squads
        </Group>
      ),
      textAlign: "center",
      columns: [
        {
          accessor: "sqkill",
          title: "Killed",
          textAlign: "center",
          render: ({ counters }) => counters.sqkill ?? "N/A",
        },
        {
          accessor: "sqprod",
          title: "Made / Lost",
          textAlign: "center",
          render: ({ counters }) => `${counters.sqprod ?? "N/A"} / ${counters.sqlost ?? "N/A"}`,
        },
      ],
    },
    {
      id: "Vehicles",
      title: (
        <Group gap={"xs"} justify="center">
          <Image
            src={getIconsPathOnCDN(`/icons/races/common/symbols/building_tank_depot.webp`)}
            alt="vehicles"
            width={20}
            height={20}
          />
          Vehicles
        </Group>
      ),
      textAlign: "center",
      columns: [
        {
          accessor: "vkill",
          title: "Killed",
          textAlign: "center",
          render: ({ counters }) => counters.vkill ?? "N/A",
        },
        {
          accessor: "vprod",
          title: "Made / Lost",
          textAlign: "center",
          render: ({ counters }) => `${counters.vprod ?? "N/A"} / ${counters.vlost ?? "N/A"}`,
        },
        {
          accessor: "vprod",
          hidden: true,
          title: "Abandoned / Captured",
          textAlign: "center",
          render: ({ counters }) => `${counters.vabnd ?? "N/A"} / ${counters.vcap ?? "N/A"}`,
        },
      ],
    },
    {
      id: "strategy-points",
      title: (
        <Group gap={"xs"} justify="center">
          <Image
            src={getIconsPathOnCDN(`10_retreatpoint`, "export_flatten")}
            alt="vehicles"
            width={15}
            height={15}
          />
          Strategy points
        </Group>
      ),
      textAlign: "center",
      columns: [
        {
          accessor: "pcap",
          title: "Captured / Lost",
          textAlign: "center",
          render: ({ counters }) => `${counters.pcap ?? "N/A"} / ${counters.plost ?? "N/A"}`,
        },
        {
          accessor: "precap",
          title: "Recaptured",
          textAlign: "center",
          render: ({ counters }) => counters.precap ?? "N/A",
        },
      ],
    },
    {
      id: "abil-used",
      title: "Abilities Used",
      textAlign: "center",
      columns: [
        {
          accessor: "abil",
          title: "Unit",
          textAlign: "center",
          render: ({ counters }) => counters.abil ?? "N/A",
        },
        {
          accessor: "cabil",
          title: "BG",
          textAlign: "center",
          render: ({ counters }) => counters.cabil ?? "N/A",
        },
      ],
    },
    {
      id: "time-commands",
      title: "",
      textAlign: "center",
      columns: [
        {
          accessor: "totalcmds",
          title: "APM",
          textAlign: "center",
          render: (record) => {
            console.log(record);
            const gameTimeMinutes = record.counters.gt / 60;
            const commands = record.counters.totalcmds;
            const apm = (commands / gameTimeMinutes).toFixed(0);

            return <>{apm}</>;
          },
        },
        {
          accessor: "gt",
          title: "Game Time",
          textAlign: "center",
          render: ({ counters }) => <>{getMatchDurationGameTime(counters.gt) ?? "N/A"}</>,
        },
      ],
    },
  ];

  return (
    <Group gap={"1"} wrap="nowrap" align="stretch">
      {/*<div className={`${classes["vertical-header"]} ${isWinner ? classes["win-indicator"] : classes["loss-indicator"]}`}>*/}
      {/*  {isWinner ? "VICTORY" : "DEFEAT"}*/}
      {/*</div>*/}
      <DataTable
        highlightOnHover
        withColumnBorders
        striped={true}
        records={[...data]}
        groups={tableGroups}
        withTableBorder={true}
        borderRadius="md"
        // xs is 10
        horizontalSpacing="6"
        // columns={columns}
        // rowExpansion={{
        //   content: ({ record }) => <ExpandedRowContent record={record} />,
        //   allowMultiple: true,
        //   expanded: {
        //     recordIds: expandedRecordIds,
        //     onRecordIdsChange: setExpandedRecordIds,
        //   },
        // }}
        // rowStyle={() => ({
        //   backgroundColor: isWinner ? "#D1E4D0" : "#E4D0D1",
        //   color: "black",
        // })}
        // onRowClick={({ record }) => {
        //   setExpandedRecordIds((currentIds) =>
        //     currentIds.includes(record.profile.alias)
        //       ? currentIds.filter((id) => id !== record.profile.alias)
        //       : [...currentIds, record.profile.alias],
        //   );
        // }}
      />
    </Group>
  );
};

// interface ExpandedRowContentProps {
//   record: PlayerReport;
// }

// const ExpandedRowContent = ({}: ExpandedRowContentProps) => {
//   return <></>;
// };

export default PlayerMatchesDataTable;
