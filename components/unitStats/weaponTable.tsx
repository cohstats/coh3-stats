import { useEffect, useState } from "react";
import { Group, TextInput, Image, Title, Space, Tooltip, ActionIcon } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

import { getFactionIcon, WeaponClass } from "../../src/unitStats";
import { getIconsPathOnCDN, internalSlash } from "../../src/utils";

import { DataTable, DataTableColumnGroup } from "mantine-datatable";

export const WeaponTableColumnKeys = [
  "id", // it's used for key in the table
  "faction", // is used for filtering
  "type", // is used for filtering
  "icon_name",
  "screen_name",
  "accu_near",
  "accu_mid",
  "accu_far",
  "mv_accu_mul",
  "mv_cd_mul",
  "rpm_near",
  "rpm_mid",
  "rpm_far",
  "range_near",
  "range_mid",
  "range_far",
  "pen_near",
  "pen_mid",
  "pen_far",
  "sct_near",
  "sct_mid",
  "sct_far",
  "dmg_min",
  "dmg_max",
  "aoe_damage_far", // aoe_damage_far
  "aoe_damage_mid", // aoe_damage_mid
  "aoe_damage_near", // aoe_damage_near
] as const;

export interface WeaponTableRow extends Record<(typeof WeaponTableColumnKeys)[number], any> {
  id: string; // it's used for key in the table
  faction: string; // is used for filtering
  type: (typeof WeaponClass)[number]; // is used for filtering
  icon_name: string | null;
  screen_name: string;
  // WTF is accuracy "near" :D
  accu_near: number | "near"; // accuracy_near
  accu_mid: number; // accuracy_mid
  accu_far: number; // accuracy_far
  mv_accu_mul: number | "-"; // moving_accuracy_multiplier
  mv_cd_mul: number | "-"; // moving_cooldown_multiplier
  rpm_near: number | "-";
  rpm_mid: number | "-";
  rpm_far: number | "-";
  range_near: number | "-";
  range_mid: number | "-";
  range_far: number | "-";
  pen_near: number | "-";
  pen_mid: number | "-";
  pen_far: number | "-";
  sct_near: number | "-"; // scatter_near
  sct_mid: number | "-"; // scatter_mid
  sct_far: number | "-"; // scatter_far
  dmg_min: number; // damage_min
  dmg_max: number; // damage_max
  aoe_damage_far: number; // aoe_damage_far
  aoe_damage_mid: number; // aoe_damage_mid
  aoe_damage_near: number; // aoe_damage_near
}

const TableGroups: DataTableColumnGroup<WeaponTableRow>[] = [
  {
    id: "Weapon info",
    columns: [
      {
        accessor: "id",
        title: "ID",
        // toggleable: true,
        defaultToggle: false,
        hidden: true,
      },
      {
        accessor: "faction",
        sortKey: "faction",
        title: "Faction",
        // toggleable: true,
        render: (record) => {
          return (
            <Image
              width={60}
              height={40}
              key={`${record.id}-faction`}
              src={getFactionIcon(record.faction)}
              fit="contain"
              alt={record.faction}
            />
          );
        },
      },
      {
        accessor: "type_icon",
        sortKey: "type",
        title: "Type",
        width: 60,
        // toggleable: true,
        render: (record) => {
          return (
            <Image
              width={60}
              height={40}
              key={`${record.id}-type`}
              src={getIconsPathOnCDN(getWeaponClassIcon(record.type))}
              fit="contain"
              alt={record.type}
            />
          );
        },
      },
      {
        accessor: "icon_name",
        sortKey: "id",
        title: "Symbol",
        textAlign: "center",
        // toggleable: true,
        render: (record) => {
          if (record.icon_name === null) return "-";

          return (
            <Image
              key={`${record.id}-icon`}
              height={40}
              src={getIconsPathOnCDN("icons/" + record.icon_name)}
              fit="scale-down"
              alt={record.icon_name || record.id}
            />
          );
        },
      },
      {
        accessor: "screen_name",
        title: "Name",
        // toggleable: true,
      },
    ],
  },
  {
    id: "Moving Multiplayer",
    columns: [
      {
        accessor: "mv_accu_mul",
        title: (
          <>
            <Tooltip label={"Accuracy"}>
              <span>Acc</span>
            </Tooltip>
          </>
        ),
        // toggleable: true,
        // width: 80,
      },
      {
        accessor: "mv_cd_mul",
        title: (
          <>
            <Tooltip label={"Cooldown"}>
              <span>CD</span>
            </Tooltip>
          </>
        ),
        // toggleable: true,
        // width: 60,
      },
    ],
  },
  {
    id: "Accuracy",
    columns: [
      {
        accessor: "accu_near",
        title: "Near",
        // toggleable: true,
        // width: 80,
        render: (record) => {
          // limit to 3 decimal places, but don't show them when there are none
          if (record.accu_near === "near") return record.accu_near;
          return parseFloat(record.accu_near.toFixed(3)).toString();
        },
      },
      {
        accessor: "accu_mid",
        title: "Mid",
        // toggleable: true,
        // width: 80,
        render: (record) => {
          // limit to 3 decimal places, but don't show them when there are none
          return parseFloat(record.accu_mid?.toFixed(3)).toString();
        },
      },
      {
        accessor: "accu_far",
        title: "Far",
        // toggleable: true,
        // width: 80,
        render: (record) => {
          // limit to 3 decimal places, but don't show them when there are none
          return parseFloat(record.accu_far?.toFixed(3)).toString();
        },
      },
    ],
  },
  {
    id: "RPM",
    columns: [
      {
        accessor: "rpm_near",
        title: "Near",
        // toggleable: true,
        // width: 80,
      },
      {
        accessor: "rpm_mid",
        title: "Mid",
        // toggleable: true,
        // width: 80,
      },
      {
        accessor: "rpm_far",
        title: "Far",
        // toggleable: true,
        // width: 80,
      },
    ],
  },
  {
    id: "Scatter",
    columns: [
      {
        accessor: "sct_near",
        title: "Near",
        // toggleable: true,
        // width: 80,
      },
      {
        accessor: "sct_mid",
        title: "Mid",
        // toggleable: true,
        // width: 80,
      },
      {
        accessor: "sct_far",
        title: "Far",
        // toggleable: true,
        // width: 80,
      },
    ],
  },
  {
    id: "Penetration",
    columns: [
      {
        accessor: "pen_near",
        title: "Near",
        // toggleable: true,
        // width: 80,
      },
      {
        accessor: "pen_mid",
        title: "Mid",
        // toggleable: true,
        // width: 80,
      },
      {
        accessor: "pen_far",
        title: "Far",
        // toggleable: true,
        // width: 80,
      },
    ],
  },
  {
    id: "Damage",
    columns: [
      {
        accessor: "damage_min",
        title: "Min / Max",
        render: (record) => {
          return `${record.dmg_min} / ${record.dmg_max}`;
        },
      },
      // {
      //   accessor: "damage_min",
      //   title: "Min",
      //   // toggleable: true,
      //   // width: 80,
      // },
      // {
      //   accessor: "damage_max",
      //   title: "Max",
      //   // toggleable: true,
      //   // width: 80,
      // },
    ],
  },
];

let tableData: WeaponTableRow[] = [];

interface inputProps {
  inputData: WeaponTableRow[];
}

function filterData(
  data: WeaponTableRow[],
  search: string,
  factionFilter: string[],
  typeFilter: string[],
) {
  const query = search.toLowerCase().trim();
  let result = data.filter((item) =>
    WeaponTableColumnKeys.some(
      (key) =>
        typeof item[key] == "string" && (item[key] as string).toLowerCase().includes(query),
    ),
  );
  result = applyFilter(result, factionFilter, "faction");
  result = applyFilter(result, typeFilter, "type");
  return result;
}

function sortData(
  data: WeaponTableRow[],
  payload: {
    sortBy: keyof WeaponTableRow | null;
    reversed: boolean;
    search: string;
    factionFilter: string[];
    typeFilter: string[];
  },
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search, payload.factionFilter, payload.typeFilter);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (typeof a[sortBy] == "string") {
        if (payload.reversed) {
          return (b[sortBy] as string).localeCompare(a[sortBy] as string);
        }

        return (a[sortBy] as string).localeCompare(b[sortBy] as string);
      }

      if (typeof a[sortBy] == "number") {
        if (payload.reversed) {
          return (b[sortBy] as number) > (a[sortBy] as number) ? 1 : -1;
        }
        return (a[sortBy] as number) > (b[sortBy] as number) ? 1 : -1;
      }
      return 0;
    }),
    payload.search,
    payload.factionFilter,
    payload.typeFilter,
  );
}

const applyFilter = (
  data: WeaponTableRow[],
  filter: string[],
  property: keyof WeaponTableRow,
) => {
  return data.filter((item) => filter.includes(item[property] as string) || filter.length == 0);
};

const generateFactionFilterButtons = (callback: (...args: any) => void, unitFilter: string[]) => {
  const factions = ["afrika_korps", "american", "british_africa", "german"];
  const filterButtons: any[] = [];

  for (const faction of factions) {
    const source = getFactionIcon(faction);
    const formattedFactionName = faction.split("_").join(" ");
    filterButtons.push(
      <Tooltip key={faction + "Filter"} label={`Filter ${formattedFactionName}`}>
        <ActionIcon
          key={faction + "FilterAction"}
          size="sm"
          variant={unitFilter.includes(faction) ? "gradient" : "transparent"}
          onClick={() => callback(faction, unitFilter)}
        >
          <Image src={source} alt={"Filter"}></Image>
        </ActionIcon>
      </Tooltip>,
    );
  }

  return filterButtons;
};

const generateWeaponClassFilterButtons = (
  callback: (...args: any) => void,
  typeFilter: string[],
) => {
  const omitTypes: Array<(typeof WeaponClass)[number]> = [
    "rifle_grenade",
    "throwing_knife",
    "nebelwerfer",
    "panzerbuschse",
    "panzerfaust",
    "melee",
    "cannon_small",
    "white_phosphorus",
    "construction_tool",
    "smoke",
    "mine",
    "minesweeper",
    "dummy",
  ];
  const types = WeaponClass.filter((x) => !omitTypes.includes(x));
  const filterButtons = [];

  for (const type of types) {
    const source = getWeaponClassIcon(type);
    filterButtons.push(
      <Tooltip key={type + "Filter"} label={`Filter by ${type}`}>
        <ActionIcon
          key={type + "FilterAction"}
          size="md"
          variant={typeFilter.includes(type) ? "gradient" : "transparent"}
          onClick={() => callback(type, typeFilter)}
        >
          <Image src={getIconsPathOnCDN(source)} alt={"Filter"}></Image>
        </ActionIcon>
      </Tooltip>,
    );
  }

  return filterButtons;
};

export const getWeaponClassIcon = (type: (typeof WeaponClass)[number]) => {
  let icon = "";
  switch (type) {
    case "rifle":
      icon = "/icons/races/american/symbols/riflemen_us.webp";
      break;
    case "flame":
      icon = "/icons/unit_status/bw2/flame.webp";
      break;
    case "sniper":
      icon = "/icons/races/common/symbols/sniper.webp";
      break;
    case "hmg":
      icon = "/icons/common/weapons/weapon_mg42.webp";
      break;
    case "lmg":
      icon = "/icons/common/weapons/weapon_lmg_mg34.webp";
      break;
    case "smg":
      icon = "/icons/common/weapons/smg_mp44_infrared.webp";
      break;
    case "cannon_burst":
      icon = "/icons/common/weapons/tank_kwk.webp";
      break;
    case "grenade_launcher":
      icon = "/icons/common/weapons/weapon_grb_grenade_launcher.webp";
      break;
    case "bazooka":
      icon = "/icons/races/american/symbols/bazooka_team_us.webp";
      break;
    case "at_gun":
      icon = "/icons/races/german/symbols/75mm_at_gun_ger.webp";
      break;
    case "mortar":
      icon = "/icons/races/common/symbols/mortar.webp";
      break;
    case "artillery_medium":
      icon = "/icons/unit_status/bw2/designated_artillery_overwatch_active.webp";
      break;
    case "cannon":
      icon = "/icons/unit_status/bw2/anti_tank.webp";
      break;
    case "artillery_small":
      icon = "/icons/unit_status/bw2/active_artillery.webp";
      break;
    case "artillery_mobile":
      icon = "/icons/common/units/symbols/artillery.webp";
      break;
    case "pistol":
      icon = "/icons/common/units/symbols/unit_british_officer_symbol.webp";
      break;
    default:
      icon = "/icons/races/common/symbols/building_weapon_support.webp";
      break;
  }
  return internalSlash(icon);
};

const PAGE_SIZE = 150;

export const WeaponTable = ({ inputData }: inputProps) => {
  tableData = inputData;

  const toggleId = "weapon-toggleable-id";

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [factionFilter, setFactionFilter] = useState([] as string[]);
  const [typeFilter, setTypeFilter] = useState([] as string[]);

  const [sortedData, setSortedData] = useState(tableData);
  const [pagedData, setPagedData] = useState(sortedData.slice(0, PAGE_SIZE));

  const [sortBy] = useState<keyof WeaponTableRow | null>(null);
  const [reverseSortDirection] = useState(false);

  const [debouncedSearch] = useDebouncedValue(search, 600);
  // const { effectiveColumns, resetColumnsToggle } = useDataTableColumns<WeaponTableRow>({
  //   key: toggleId,
  //   columns: TableColumns,
  // });

  useEffect(() => {
    setPagedData(sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
  }, [sortedData, page]);

  useEffect(() => {
    setSortedData(
      sortData(tableData, {
        sortBy,
        reversed: reverseSortDirection,
        search: debouncedSearch,
        factionFilter,
        typeFilter,
      }),
    );
  }, [debouncedSearch]);

  function toggleFilter(filterValue: string, filterList: string[]) {
    const filterValueIndex = filterList.indexOf(filterValue);
    if (filterValueIndex < 0) filterList.push(filterValue);
    else filterList.splice(filterValueIndex, 1);

    setFactionFilter([...factionFilter]);
    setTypeFilter([...typeFilter]);
    setSortedData(
      sortData(tableData, {
        sortBy,
        reversed: reverseSortDirection,
        search: search,
        factionFilter,
        typeFilter,
      }),
    );
  }

  return (
    <div>
      <Title order={2}>Company of Heroes 3 - Weapons Browser </Title>

      <Space h={"md"} />
      <div>
        <Group justify={"space-between"}>
          <Group>
            <Space w={"sm"} />
            <Group wrap="nowrap">
              {generateFactionFilterButtons(toggleFilter, factionFilter)}
            </Group>
            <Space w={"md"} />
            <Group wrap="wrap">
              {generateWeaponClassFilterButtons(toggleFilter, typeFilter)}
            </Group>
          </Group>
          <TextInput
            placeholder="Search Weapon"
            mb="md"
            leftSection={<IconSearch size="0.9rem" stroke={1.5} />}
            value={search}
            onChange={(event: { currentTarget: { value: any } }) => {
              setSearch(event.currentTarget.value);
            }}
          />
        </Group>
      </div>
      <div>
        <DataTable
          withTableBorder={true}
          borderRadius="md"
          idAccessor={"id"}
          highlightOnHover
          withColumnBorders
          height={600}
          miw={700}
          striped={true}
          storeColumnsKey={toggleId}
          groups={TableGroups}
          // columns={effectiveColumns}
          records={pagedData}
          verticalSpacing={4}
          totalRecords={sortedData.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};
