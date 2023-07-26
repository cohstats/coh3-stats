import React, { useState } from "react";
//import { LevelContext } from './LevelContext.js';

import {
  Avatar,
  Group,
  Image,
  ActionIcon,
  Stack,
  Flex,
  Grid,
  Tooltip,
  Text,
  Anchor,
  Card,
  HoverCard,
} from "@mantine/core";
import { WeaponSearch } from "./weaponSearch";
import { WeaponType } from "../../src/unitStats/mappingWeapon";
import { DpsWeaponCard } from "./dpsWeaponCard";
import { ebpsStats, EbpsType, getSquadTotalCost } from "../../src/unitStats";
import {
  CustomizableUnit,
  getSbpsUpgrades,
  getSbpsWeapons,
  resolveFactionLinkid,
  WeaponMember,
} from "../../src/unitStats/dpsCommon";
import Link from "next/link";
import { UnitSquadCard } from "../unit-cards/unit-squad-card";
import { UnitCostCard } from "../unit-cards/unit-cost-card";
import { HitpointCard } from "../unit-cards/hitpoints-card";

interface IUnitProps {
  unit: CustomizableUnit;
  onChange: any;
  index: number;
  ebps: EbpsType[];
  weapons: WeaponType[];
}

export const DpsUnitCustomizing = (props: IUnitProps) => {
  const weaponListInit: WeaponMember[] = [];
  //const [activeData] = useState(props.unit);
  const [weaponList, setWeaponList] = useState(weaponListInit);

  // create weapon list
  if (weaponList.length == 0) {
    const weapons = getSbpsWeapons(props.unit.sbps, props.ebps, props.weapons);
    const weaponUpgrades = getSbpsUpgrades(props.unit.sbps, props.ebps, props.weapons);
    for (const weaponUpgrade of weaponUpgrades) {
      // check if weapon is already available
      if (weapons.find((member) => member.weapon_id == weaponUpgrade.weapon_id)) continue;
      weapons.push(weaponUpgrade);
    }
    setWeaponList(weapons);
  }

  function onAddWeapon(selectionItem: WeaponMember) {
    // check if weapon have already been added
    if (props.unit.weapon_member.find((weapon) => weapon.weapon_id == selectionItem.weapon_id))
      return;

    // Clone Weapon so we can configure it localy
    // clone only when creating an instance. Not when changing.
    const clone = { ...selectionItem };
    if (!clone.num) clone.num = 1;

    //for (const weapon of selectionItem) {
    props.unit.weapon_member.push(clone);
    props.onChange(props.unit);
  }

  // Weapon number changed
  function onWeaponNumberChange() {
    //const weapon = props.unit.weapon_member.find((mem) => mem.weapon_id == member.weapon_id);
    //if (weapon) weapon.num = member.num;
    props.onChange(props.unit);
  }

  function onMovingChange() {
    props.unit.is_moving = !props.unit.is_moving;
    props.onChange(props.unit);
  }

  function onCoverChange(cover: string) {
    if (props.unit.cover != cover) props.unit.cover = cover;
    else props.unit.cover = "";
    props.onChange(props.unit);
  }

  // Weapon card deleted
  function onDelete(member: WeaponMember) {
    props.unit.weapon_member.forEach((ldout) => {
      if (ldout.weapon_id == member.weapon_id) {
        const index = props.unit.weapon_member.indexOf(ldout);
        props.unit.weapon_member.splice(index, 1);
      }
    });
    props.onChange(props.unit);
  }

  const components: any[] = [];
  // create weapon member
  for (const member of props.unit.weapon_member) {
    components.push(
      <DpsWeaponCard
        weapon_member={member}
        key={member.weapon_id + props.index}
        onDeleteMember={onDelete}
        onNumberChange={onWeaponNumberChange}
      ></DpsWeaponCard>,
    );
  }
  const totalCost = getSquadTotalCost(props.unit.sbps, props.ebps);
  return (
    <>
      <Stack align="left" justify="flex-start" spacing="xs">
        <Grid gutter="xs">
          <Grid.Col span={4}>
            <Group noWrap>
              <Tooltip label={props.unit.screen_name}>
                <HoverCard shadow="md" width={400} position="left" offset={50}>
                  <HoverCard.Target>
                    <Group>
                      <Anchor
                        color="undefined"
                        underline={false}
                        sx={{
                          "&:hover": {
                            textDecoration: "none",
                          },
                        }}
                        component={Link}
                        href={
                          `/explorer/races/${resolveFactionLinkid(props.unit.faction)}/units/` +
                          props.unit.id
                        }
                      >
                        <Avatar
                          src={props.unit.icon_name}
                          alt={props.unit.screen_name}
                          placeholder="/icons/general/infantry_icn.png"
                          radius="xs"
                          size="md"
                        />
                        {/* <Card p="lg" radius="md" withBorder>
                  {UnitDescriptionCard(desc)}
                  {UnitCostCard(time_cost)}
                </Card> */}
                      </Anchor>
                    </Group>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Stack>
                      <UnitSquadCard
                        id={props.unit.id}
                        ui={{
                          armorIcon: props.unit.sbps.ui.armorIcon,
                        }}
                        health={{
                          armor: props.unit.ebps_default.health.armorLayout.armor,
                          frontal: props.unit.ebps_default.health.armorLayout.frontArmor,
                          rear: props.unit.ebps_default.health.armorLayout.rearArmor,
                          side: props.unit.ebps_default.health.armorLayout.sideArmor,
                          targetSize: props.unit.ebps_default.health.targetSize,
                        }}
                        type={props.unit.unit_type}
                        sight={{
                          coneAngle: 1,
                          outerRadius:
                            props.unit.ebps_default.sight_ext.sight_package.outer_radius,
                        }}
                        moving={{
                          defaultSpeed:
                            props.unit.ebps_default.moving_ext.speed_scaling_table.default_speed,
                          maxSpeed:
                            props.unit.ebps_default.moving_ext.speed_scaling_table.max_speed,
                          acceleration: props.unit.ebps_default.moving_ext.acceleration,
                          deceleration: props.unit.ebps_default.moving_ext.deceleration,
                        }}
                        range={{
                          max: props.unit.weapon_member[0]?.weapon.weapon_bag.range.max || 0,
                        }}
                      />
                      {UnitCostCard(totalCost)}
                    </Stack>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Tooltip>
              <Flex align="center">
                <HoverCard width={400} position="left" offset={80}>
                  <HoverCard.Target>
                    <Image
                      src="\icons\general\health.png"
                      alt="Health"
                      width={32}
                      height={32}
                    ></Image>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Card p="lg" radius="md">
                      {HitpointCard({ squad: props.unit.sbps, entities: ebpsStats })}
                    </Card>
                  </HoverCard.Dropdown>
                </HoverCard>

                <Text size="xs">{props.unit.health} HP</Text>
              </Flex>
            </Group>
          </Grid.Col>
          <Grid.Col span={8}>
            <Flex gap="xs" justify="flex-end" align="center" direction="row" wrap="wrap">
              {/* <Rating defaultValue={0} size="sm" count={3} /> */}
              <Tooltip label="Moving">
                <ActionIcon
                  size="lg"
                  onChange={onMovingChange}
                  onClick={onMovingChange}
                  variant={props.unit.is_moving ? "default" : "trannsparent"}
                >
                  <Image
                    src="\icons\common\abilities\tactical_movement_riflemen_us.png"
                    alt="Moving"
                  ></Image>
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Heavy Cover">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "heavy" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("heavy")}
                >
                  <Image src="/icons/common/cover/heavy.png" alt="Heavy Cover"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Light Cover">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "light" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("light")}
                >
                  <Image src="/icons/common/cover/light.png" alt="Light Cover"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Negative Cover">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "negative" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("negative")}
                >
                  <Image src="/icons/common/cover/negative.png" alt="Negative Cover"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Garrison">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "garrison" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("garrison")}
                >
                  <Image src="/icons/common/units/garrisoned.png" alt="Garrision"></Image>
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
