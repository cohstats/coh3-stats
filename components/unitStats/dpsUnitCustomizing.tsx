import React, { useState } from "react";
//import { LevelContext } from './LevelContext.js';

import {
  createStyles,
  Avatar,
  Group,
  Image,
  ActionIcon,
  Stack,
  Flex,
  Grid,
  Tooltip,
} from "@mantine/core";
import { WeaponSearch } from "./weaponSearch";
import { WeaponStats, WeaponType } from "../../src/unitStats/mappingWeapon";
import { DpsWeaponCard, weaponMember } from "./dpsWeaponCard";
import slash from "slash";

export type CustomizableUnit = {
  id: string; // filename  -> eg. panzergrenadier_ak
  screenName: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\screen_name
  path: string; // path to object
  faction: string; // from folder structure races\[factionName]
  loadout: weaponMember[]; // set of weapons + amount
  unitType: string; // folder Infantry | vehicles | team_weapons | buildings
  helpText: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\help_text
  iconName: string; // sbpextensions\squad_ui_ext\race_list\race_data\info\icon_name
  factionIcon: string;
  cover: string;
  isMoving: boolean;
  targetSize: number;
  armor: number;
  value: string; // must have value, otherwise multiselect will not work
  label: string; // For drop down
  image: string;
  description: string;
};

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.blue[5],
    color: theme.white,
  },
  inner: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[0],
  },
}));

const computeWeaponList = (unit: CustomizableUnit) => {
  const result: any[] = [];

  for (const weapon of WeaponStats) {
    if (weapon.faction == unit.faction && weapon.parent != "heavy_machine_gun")
      result.push(weapon);
  }
  return result;
};

interface IUnitProps {
  unit: CustomizableUnit;
  onChange: any;
  index: number;
}

export const DpsUnitCustomizing = (props: IUnitProps) => {
  const weaponListInit: WeaponType[] = [];
  const [activeData, setActiveData] = useState(props.unit);
  const [weaponList, setWeaponList] = useState(weaponListInit);
  const { classes } = useStyles();

  if (weaponList.length == 0) setWeaponList(computeWeaponList(props.unit));

  function onAddWeapon(selectionItem: weaponMember) {
    // check if weapon have already been added
    if (activeData.loadout.find((weapon) => weapon.id == selectionItem.id)) return;

    // Clone Weapon so we can configure it localy
    // clone only when creating an instance. Not when changing.
    const clone = { ...selectionItem };
    if (!clone.num) clone.num = 1;

    //for (const weapon of selectionItem) {
    activeData.loadout.push(clone);

    props.onChange(activeData);
  }

  // Weapon number changed
  function onWeaponNumberChange(member: weaponMember) {
    const weapon = activeData.loadout.find((mem) => mem.id == member.id);
    if (weapon) weapon.num = member.num;
    props.onChange(activeData);
  }

  function onMovingChange() {
    activeData.isMoving = !activeData.isMoving;
    props.onChange(activeData);
  }

  function onCoverChange(cover: string) {
    if (activeData.cover != cover) activeData.cover = cover;
    else activeData.cover = "";
    props.onChange(activeData);
  }

  // Weapon card deleted
  function onDelete(member: weaponMember) {
    activeData.loadout.forEach((ldout) => {
      if (ldout.id == member.id) {
        const index = activeData.loadout.indexOf(ldout);
        activeData.loadout.splice(index, 1);
      }
    });
    props.onChange(activeData);
  }

  const components: any[] = [];
  // create weapon member
  for (const member of activeData.loadout) {
    components.push(
      <DpsWeaponCard
        defaultNum={member.num}
        key={member.id + props.index}
        weapon={member}
        onDeleteMember={onDelete}
        onNumberChange={onWeaponNumberChange}
      ></DpsWeaponCard>,
    );
  }

  return (
    <>
      <Stack align="left" justify="flex-start" spacing="xs">
        <Grid gutter="xs">
          <Grid.Col span={4}>
            <Tooltip label={activeData.screenName}>
              <Avatar
                src={slash(activeData.iconName)}
                alt={activeData.screenName}
                placeholder="/icons/common/cover/heavy.png"
                radius="xs"
                size="md"
              />
            </Tooltip>
          </Grid.Col>
          <Grid.Col span={8}>
            <Flex gap="xs" justify="flex-end" align="center" direction="row" wrap="wrap">
              {/* <Rating defaultValue={0} size="sm" count={3} /> */}
              <Tooltip label="Moving">
                <ActionIcon
                  size="lg"
                  onChange={onMovingChange}
                  onClick={onMovingChange}
                  variant={activeData.isMoving ? "default" : "trannsparent"}
                >
                  <Image src="\icons\common\abilities\tactical_movement_riflemen_us.png"></Image>
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Heavy Cover">
                <ActionIcon
                  size="lg"
                  variant={activeData.cover == "heavy" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("heavy")}
                >
                  <Image src="/icons/common/cover/heavy.png"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Light Cover">
                <ActionIcon
                  size="lg"
                  variant={activeData.cover == "light" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("light")}
                >
                  <Image src="/icons/common/cover/light.png"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Negative Cover">
                <ActionIcon
                  size="lg"
                  variant={activeData.cover == "negative" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("negative")}
                >
                  <Image src="/icons/common/cover/negative.png"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Garrison">
                <ActionIcon
                  size="lg"
                  variant={activeData.cover == "garrison" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("garrison")}
                >
                  <Image src="/icons/common/units/garrisoned.png"></Image>
                </ActionIcon>
              </Tooltip>
            </Flex>
          </Grid.Col>
        </Grid>

        <WeaponSearch searchData={weaponList} onSelect={onAddWeapon}></WeaponSearch>

        <Group spacing="xs">{components}</Group>
      </Stack>
      {/* </Box> */}
    </>
  );
};
