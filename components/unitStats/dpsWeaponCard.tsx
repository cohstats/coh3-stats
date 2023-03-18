import React, { useState } from "react";
//import { LevelContext } from './LevelContext.js';

import {
  // createStyles,
  Space,
  Image,
  Text,
  NumberInput,
  Box,
  Group,
  CloseButton,
} from "@mantine/core";

export type weaponMember = {
  id: string;
  num: number;
  unit: string;
};

interface IDPSProps {
  weapon: any;
  defaultNum: number;
  onNumberChange: any;
  onDeleteMember: any;
  unit: string;
}

export const DpsWeaponCard = (props: IDPSProps) => {
  const weaponMember: weaponMember = {
    id: props.weapon.id,
    num: props.defaultNum,
    unit: props.unit,
  };

  const [activeData, setActiveData] = useState(weaponMember);

  function onNumberChanged(value: number) {
    if (value <= 0 && activeData.num == 0) {
      activeData.num = 0;
      value = 0;
      return;
    }

    if (value <= 0) value = 0;

    activeData.num = value;
    setActiveData({ ...activeData });
    props.onNumberChange(activeData);
  }

  function onDeleteWeapon() {
    props.onDeleteMember(activeData);
    return;
  }

  return (
    <>
      <Box
        sx={(theme) => ({
          // backgroundColor:
          //   theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
          //border: theme.colorScheme === "dark" ? "solid 1px " + theme.colors.dark[4] : "solid 1px " + theme.colors.gray[4] ,
          padding: theme.spacing.xs,
          borderRadius: theme.radius.md,
        })}
      >
        <Group>
          <Image
            width={60}
            height={30}
            src={props.weapon.image}
            fit="contain"
            alt={activeData.id}
          />
          <CloseButton aria-label="Close modal" onClick={onDeleteWeapon} />
        </Group>

        <Text size="xs">{activeData.id}</Text>
        <Space h="xs"></Space>
        <Box
          sx={() => ({
            width: "60px",
          })}
        >
          <NumberInput defaultValue={activeData.num} size="xs" onChange={onNumberChanged} />
        </Box>
      </Box>
    </>
  );
};
