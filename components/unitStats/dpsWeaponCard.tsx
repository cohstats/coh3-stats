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
import { WeaponMember } from "../../src/unitStats/dpsCommon";

interface IDPSProps {
  weapon_member: WeaponMember;
  onNumberChange: any;
  onDeleteMember: any;
}

export const DpsWeaponCard = (props: IDPSProps) => {
  // const weaponMember =

  const [activeData] = useState(props.weapon_member);

  function onNumberChanged(value: number) {
    if (value <= 0 && activeData.num == 0) {
      activeData.num = 0;
      value = 0;
      return;
    }

    if (value <= 0) value = 0;

    activeData.num = value;
    // setActiveData({ ...activeData });
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
            src={props.weapon_member.image}
            fit="contain"
            alt={activeData.weapon_id}
          />
          <CloseButton aria-label="Close modal" onClick={onDeleteWeapon} />
        </Group>

        <Text size="xs">{activeData.weapon_id}</Text>
        <Space h="xs"></Space>
        {activeData.ebps.unitType == "infantry" && (
          <Box
            sx={() => ({
              width: "60px",
            })}
          >
            <NumberInput defaultValue={activeData.num} size="xs" onChange={onNumberChanged} />
          </Box>
        )}
      </Box>
    </>
  );
};
