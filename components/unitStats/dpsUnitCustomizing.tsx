import React, { useState } from "react";
//import { LevelContext } from './LevelContext.js';

import {
  Paper,
  createStyles,
  Container,
  Space,
  useMantineTheme,
  SimpleGrid,
  Rating,
  Avatar,
  Group,
  Image,
  Text,
  NumberInput,
  ActionIcon,
  Box,
  Stack,
} from "@mantine/core";
import { WeaponSearch } from "./weaponSearch";
import { WeaponStats } from "../../src/unitStats/mappingWeapon";
import { resolveLocstring } from "../../src/unitStats/locstring";
import { DpsWeaponCard, weaponMember } from "./dpsWeaponCard";
import { Interface } from "readline";

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

interface IUnitProps {
  unit: CustomizableUnit;
  onChange: any;
}

export const DpsUnitCustomizing = (props: IUnitProps) => {
  const [activeData, setActiveData] = useState(props.unit);
  //const [selWeapons,setSelWeapons] = useState(([] as weaponMember[]));
  const { classes } = useStyles();

  function onAddWeapon(selectionItem: weaponMember[]) {
    const selectionClone: weaponMember[] = [];

    for (const item of selectionItem) {
      const clone = { ...item };
      if (!clone.num) clone.num = 1;
      selectionClone.push(clone);
    }

    //for (const weapon of selectionItem) {
    activeData.loadout = [...activeData.loadout, ...selectionClone];
    setActiveData({ ...activeData });
    selectionItem = [];
    props.onChange(activeData);
    //}
    //selectionItem = [];
  }

  // Weapon number changed
  function onWeaponNumberChange(member: weaponMember) {
    const weapon = activeData.loadout.find((mem) => mem.id == member.id);
    if (weapon) weapon.num = member.num;
    setActiveData(activeData);
    props.onChange(activeData);
  }

  function onMovingChange() {
    activeData.isMoving = !activeData.isMoving;
    setActiveData({ ...activeData });
    props.onChange(activeData);
  }

  function onCoverChange(cover: string) {
    if (activeData.cover != cover) activeData.cover = cover;
    else activeData.cover = "";
    setActiveData({ ...activeData });
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
    setActiveData({ ...activeData });
    props.onChange(activeData);
  }

  const components: any[] = [];
  // create weapon member
  for (const member of activeData.loadout) {
    components.push(
      <DpsWeaponCard
        defaultNum={member.num}
        key={member.id}
        weapon={member}
        onDeleteMember={onDelete}
        onNumberChange={onWeaponNumberChange}
      ></DpsWeaponCard>,
    );
  }

  return (
    <>
      <Stack align="left" justify="flex-start" spacing="xs">
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[0],
            border: "solid 1px " + theme.colors.dark[6],
            textAlign: "left",
            padding: theme.spacing.xs,
            borderRadius: theme.radius.md,
          })}
        >
          <Group>
            <Avatar
              src={activeData.iconName}
              alt={activeData.screenName}
              placeholder="/icons/common/cover/heavy.png"
              radius="xs"
              size="md"
            />
            <Rating defaultValue={0} size="sm" count={3} />
            <ActionIcon
              size="lg"
              onChange={onMovingChange}
              onClick={onMovingChange}
              variant={activeData.isMoving ? "default" : "trannsparent"}
            >
              <Image src="\icons\common\abilities\tactical_movement_riflemen_us.png"></Image>
            </ActionIcon>
            <ActionIcon
              size="lg"
              variant={activeData.cover == "heavy" ? "default" : "trannsparent"}
              onClick={() => onCoverChange("heavy")}
            >
              <Image src="/icons/common/cover/heavy.png"></Image>
            </ActionIcon>
            <ActionIcon
              size="lg"
              variant={activeData.cover == "light" ? "default" : "trannsparent"}
              onClick={() => onCoverChange("light")}
            >
              <Image src="/icons/common/cover/light.png"></Image>
            </ActionIcon>
            <ActionIcon
              size="lg"
              variant={activeData.cover == "negative" ? "default" : "trannsparent"}
              onClick={() => onCoverChange("negative")}
            >
              <Image src="/icons/common/cover/negative.png"></Image>
            </ActionIcon>
            <ActionIcon
              size="lg"
              variant={activeData.cover == "garrisioned" ? "default" : "trannsparent"}
              onClick={() => onCoverChange("garrisioned")}
            >
              <Image src="/icons/common/units/garrisoned.png"></Image>
            </ActionIcon>
          </Group>
        </Box>

        <WeaponSearch searchData={WeaponStats} onSelect={onAddWeapon}></WeaponSearch>

        <Group spacing="xs">{components}</Group>
      </Stack>
    </>
  );
};
