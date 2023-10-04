import { useEffect, useState } from "react";
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  Image,
  Grid,
  Title,
  Flex,
  Space,
  HoverCard,
  Stack,
  Checkbox,
  Tooltip,
  ActionIcon,
  Anchor,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import {
  IconAdjustments,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from "@tabler/icons-react";
import { getFactionIcon } from "../../src/unitStats";
import { CustomizableUnit } from "../../src/unitStats/dpsCommon";
import { internalSlash } from "../../src/utils";
import Link from "next/link";
import { getExplorerUnitRoute } from "../../src/routes";
import { raceType } from "../../src/coh3/coh3-types";
import { useDebouncedValue } from "@mantine/hooks";

interface tableColSetup {
  key: string;
  sortKey: string;
  title: string;
  visible: boolean;
  isIcon: boolean;
  customVisual: boolean;
  canFilter: boolean;
}
const tableSetup: tableColSetup[] = [
  {
    key: "faction_icon",
    sortKey: "faction",
    title: "Faction",
    visible: true,
    isIcon: true,
    customVisual: false,
    canFilter: true,
  },
  {
    key: "type_icon",
    sortKey: "unit_type",
    title: "Type",
    visible: true,
    isIcon: true,
    customVisual: false,
    canFilter: true,
  },
  {
    key: "icon_name",
    sortKey: "id",
    title: "Unit",
    visible: true,
    isIcon: true,
    customVisual: false,
    canFilter: true,
  },
  {
    key: "screen_name",
    sortKey: "screen_name",
    title: "Description",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: true,
  },
  {
    key: "cost_mp",
    sortKey: "cost_mp",
    title: "MP",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "cost_fuel",
    sortKey: "cost_fuel",
    title: "Fuel",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "cost_pop",
    sortKey: "cost_pop",
    title: "Pop.",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "cost_reinforce",
    sortKey: "cost_reinforce",
    title: "Reinforce",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "upkeep_mp",
    sortKey: "upkeep_mp",
    title: "Upk(MP)",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "capture_rate",
    sortKey: "capture_rate",
    title: "Cap. Rate",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "capture_revert",
    sortKey: "capture_revert",
    title: "Cap. Revert",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "health",
    sortKey: "health",
    title: "Health",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "target_size",
    sortKey: "target_size",
    title: "Size",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "armor",
    sortKey: "armor",
    title: "Armor(f)",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "sight_range",
    sortKey: "sight_range",
    title: "Sight",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },

  {
    key: "dps_n",
    sortKey: "dps_n",
    title: "DPS(n)",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "dps_m",
    sortKey: "dps_m",
    title: "DPS(m)",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "dps_f",
    sortKey: "dps_f",
    title: "DPS(f)",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "range",
    sortKey: "range",
    title: "Range",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "penetration",
    sortKey: "penetration",
    title: "Pen.",
    visible: true,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
  {
    key: "speed",
    sortKey: "speed",
    title: "Speed.",
    visible: false,
    isIcon: false,
    customVisual: false,
    canFilter: false,
  },
];

const getCellVisual = (colSetup: tableColSetup, unit: CustomizableUnit) => {
  if (colSetup.isIcon)
    return (
      <Image
        width={60}
        height={40}
        src={(unit as any)[colSetup.key]}
        fit="contain"
        alt={unit.type_icon}
      />
    );

  if (!colSetup.customVisual) {
    if (colSetup.key === "screen_name") {
      return (
        <Tooltip label={(unit as any)[colSetup.key]}>
          <Anchor
            color="orange"
            component={Link}
            href={getExplorerUnitRoute(unit.faction as raceType, unit.id)}
          >
            <Text sx={{ textOverflow: "ellipsis", overflow: "hidden" }}>
              {(unit as any)[colSetup.key]}
            </Text>
          </Anchor>
        </Tooltip>
      );
    }

    let content = (unit as any)[colSetup.key];
    content = content ? content : "-";

    return <Text>{content}</Text>;
  }

  switch (colSetup.key) {
    case "dps_preview":
      return unit.dps_preview.length > 0 ? Math.floor(unit.dps_preview[0].y) : 0;

    default:
      break;
  }
};

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
  },

  control: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  icon: {
    width: rem(21),
    height: rem(21),
    borderRadius: rem(21),
  },
}));

let tableData: CustomizableUnit[] = [];

interface inputProps {
  inputData: CustomizableUnit[];
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const { classes } = useStyles();
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <th className={classes.th}>
      <UnstyledButton px={0} onClick={onSort} className={classes.control}>
        <Flex justify="space-around" align="center">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size="1rem" stroke={1.5} />
          </Center>
        </Flex>
      </UnstyledButton>
    </th>
  );
}

function filterData(
  data: CustomizableUnit[],
  search: string,
  factionFilter: string[],
  typeFilter: string[],
) {
  const query = search.toLowerCase().trim();
  let result = data.filter((item) =>
    keys(data[0]).some(
      (key) =>
        typeof item[key] == "string" && (item[key] as string).toLowerCase().includes(query),
    ),
  );
  result = applyFilter(result, factionFilter, "faction");
  result = applyFilter(result, typeFilter, "unit_type");
  return result;
}

function sortData(
  data: CustomizableUnit[],
  payload: {
    sortBy: keyof CustomizableUnit | null;
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
  data: CustomizableUnit[],
  filter: string[],
  property: keyof CustomizableUnit,
) => {
  return data.filter((item) => filter.includes(item[property] as string) || filter.length == 0);
};

const mapRow = (unit: CustomizableUnit) => {
  const rows = [];

  for (const colSetup of tableSetup) {
    if (colSetup.visible) rows.push(<td key={colSetup.key}>{getCellVisual(colSetup, unit)}</td>);
  }
  return <tr key={unit.id}>{rows}</tr>;
};

const getTableHeader = (
  sortBy: keyof CustomizableUnit,
  reverseSortDirection: boolean,
  setSorting: any,
) => {
  const tableHeader = [];
  for (const colSetup of tableSetup) {
    if (colSetup.visible)
      tableHeader.push(
        <Th
          sorted={sortBy === colSetup.sortKey}
          reversed={reverseSortDirection}
          onSort={() => setSorting(colSetup.sortKey)}
          key={colSetup.key}
        >
          {colSetup.title}
        </Th>,
      );
  }

  return tableHeader;
};

const getTableCustomizing = (onTableLayoutChange: any) => {
  const cols = [];
  for (const setup of tableSetup) {
    const checked = setup.visible;
    cols.push(
      <Checkbox
        checked={checked}
        onChange={() => onTableLayoutChange(setup)}
        title={setup.title}
        label={setup.title}
        key={setup.key}
      />,

      //   <SimpleGrid cols={2}>
      //  <div> {setup.title}</div>
      //   </SimpleGrid>
    );
  }
  return cols;
};

const generateFactionFilterButtons = (callback: any, unitFilter: string[]) => {
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
          variant={unitFilter.includes(faction) ? "gradient" : "trannsparent"}
          onClick={() => callback(faction, unitFilter)}
        >
          <Image src={source} alt={"Filter"}></Image>
        </ActionIcon>
      </Tooltip>,
    );
  }

  return filterButtons;
};

const generateTypeFilterButtons = (callback: any, typeFilter: string[]) => {
  const types = ["infantry", "vehicles", "emplacements", "team_weapons"];
  const filterButtons: any[] = [];

  for (const type of types) {
    const source = getTypeIcon(type);
    filterButtons.push(
      <Tooltip key={type + "Filter"} label={`Filter by ${type}`}>
        <ActionIcon
          key={type + "FilterAction"}
          size="md"
          variant={typeFilter.includes(type) ? "gradient" : "trannsparent"}
          onClick={() => callback(type, typeFilter)}
        >
          <Image src={source} alt={"Filter"}></Image>
        </ActionIcon>
      </Tooltip>,
    );
  }

  return filterButtons;
};

const getTypeIcon = (type: string) => {
  let icon = "";
  switch (type) {
    case "infantry":
      icon = "/unitStats/weaponClass/infantry_icn.png";
      break;
    case "vehicles":
      icon = "/unitStats/weaponClass/vehicles_icn.png";
      break;
    case "emplacements":
      icon = "/unitStats/weaponClass/building_icn.png";
      break;
    case "team_weapons":
      icon = "/unitStats/weaponClass/hmg_mg42_ger.png";
      break;
    default:
      break;
  }
  return internalSlash(icon);
};

export const UnitTable = ({ inputData }: inputProps) => {
  tableData = inputData;

  const [search, setSearch] = useState("");
  const [factionFilter, setFactionFilter] = useState([] as string[]);
  const [typeFilter, setTypeFilter] = useState([] as string[]);

  const [updateFlag, updateTable] = useState(true);
  const [sortedData, setSortedData] = useState(tableData);
  const [sortBy, setSortBy] = useState<keyof CustomizableUnit | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const [debouncedSearch] = useDebouncedValue(search, 600);

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

  const setSorting = (field: keyof CustomizableUnit) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(tableData, { sortBy: field, reversed, search, factionFilter, typeFilter }),
    );
  };

  const onTableLayoutChange = (colSetup: tableColSetup) => {
    colSetup.visible = !colSetup.visible;
    refresh();
  };

  const refresh = () => {
    updateTable(!updateFlag);
    return;
  };

  const rows = sortedData.map((unit) => mapRow(unit));

  const cols = getTableHeader(sortBy as keyof CustomizableUnit, reverseSortDirection, setSorting);

  return (
    <ScrollArea>
      <Grid>
        <Grid.Col span={10}>
          <Title order={2}>Company of Heroes 3 Unit Browser </Title>
        </Grid.Col>
        <Grid.Col span={2}>
          <Flex
            // mih={50}
            // gap="xs"
            justify="flex-end"
            //  align="center"
            //direction="row"
            wrap="wrap"
          >
            <Space h="2rem" />
            <Group>
              <HoverCard shadow="xl" width={150}>
                <HoverCard.Target>
                  <div>
                    <IconAdjustments opacity={0.6} />
                  </div>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Stack mb={12}>
                    {/* <Text size="sm">Toggle DPS vs Soft/Hard.</Text>
                      <Switch
                        label={"DPS vs Vehicles"}
                        checked={false}
                        // onChange={(event) => ; }
                        //onClick={() => setCurve(isCurve)}
                        size="xs"
                      /> */}
                    Table columns:
                    {getTableCustomizing(onTableLayoutChange)}
                  </Stack>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          </Flex>
        </Grid.Col>
      </Grid>
      <Space h={"md"} />
      <div>
        <Group position={"apart"}>
          <Group>
            <Space w={"sm"} />
            <Group noWrap>{generateFactionFilterButtons(toggleFilter, factionFilter)}</Group>
            <Space w={"md"} />
            <Group noWrap>{generateTypeFilterButtons(toggleFilter, typeFilter)}</Group>
          </Group>
          <TextInput
            placeholder="Search Unit"
            mb="md"
            icon={<IconSearch size="0.9rem" stroke={1.5} />}
            value={search}
            onChange={(event: { currentTarget: { value: any } }) => {
              setSearch(event.currentTarget.value);
            }}
          />
        </Group>
      </div>
      <div style={{ minHeight: 7000 }}>
        <Table
          horizontalSpacing="md"
          verticalSpacing="xs"
          miw={700}
          sx={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              <>{cols}</>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <tr key="no_row">
                {/* <td colSpan={Object.keys(data[0]).length}>
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td> */}
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </ScrollArea>
  );
};
