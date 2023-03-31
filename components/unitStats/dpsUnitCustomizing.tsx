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
import { WeaponStats } from "../../src/unitStats/mappingWeapon";
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
}

export const DpsUnitCustomizing = (props: IUnitProps) => {
  const weaponListInit: WeaponMember[] = [];
  const [activeData] = useState(props.unit);
  const [weaponList, setWeaponList] = useState(weaponListInit);

  // create weapon list
  if (weaponList.length == 0) {
    const weapons = getSbpsWeapons(props.unit.sbps, props.ebps, WeaponStats);
    const weaponUpgrades = getSbpsUpgrades(props.unit.sbps, props.ebps, WeaponStats);
    for (const weaponUpgrade of weaponUpgrades) {
      // check if weapon is already available
      if (weapons.find((member) => member.weapon_id == weaponUpgrade.weapon_id)) continue;
      weapons.push(weaponUpgrade);
    }
    setWeaponList(weapons);
  }

  function onAddWeapon(selectionItem: WeaponMember) {
    // check if weapon have already been added
    if (activeData.weapon_member.find((weapon) => weapon.weapon_id == selectionItem.weapon_id))
      return;

    // Clone Weapon so we can configure it localy
    // clone only when creating an instance. Not when changing.
    const clone = { ...selectionItem };
    if (!clone.num) clone.num = 1;

    //for (const weapon of selectionItem) {
    activeData.weapon_member.push(clone);
    props.onChange(activeData);
  }

  // Weapon number changed
  function onWeaponNumberChange() {
    //const weapon = activeData.weapon_member.find((mem) => mem.weapon_id == member.weapon_id);
    //if (weapon) weapon.num = member.num;
    props.onChange(activeData);
  }

  function onMovingChange() {
    activeData.is_moving = !activeData.is_moving;
    props.onChange(activeData);
  }

  function onCoverChange(cover: string) {
    if (activeData.cover != cover) activeData.cover = cover;
    else activeData.cover = "";
    props.onChange(activeData);
  }

  // Weapon card deleted
  function onDelete(member: WeaponMember) {
    activeData.weapon_member.forEach((ldout) => {
      if (ldout.weapon_id == member.weapon_id) {
        const index = activeData.weapon_member.indexOf(ldout);
        activeData.weapon_member.splice(index, 1);
      }
    });
    props.onChange(activeData);
  }

  const components: any[] = [];
  // create weapon member
  for (const member of activeData.weapon_member) {
    components.push(
      <DpsWeaponCard
        weapon_member={member}
        key={member.weapon_id + props.index}
        onDeleteMember={onDelete}
        onNumberChange={onWeaponNumberChange}
      ></DpsWeaponCard>,
    );
  }
  const totalCost = getSquadTotalCost(activeData.sbps, props.ebps);

  return (
    <>
      <Stack align="left" justify="flex-start" spacing="xs">
        <Grid gutter="xs">
          <Grid.Col span={4}>
            <Group noWrap>
              <Tooltip label={activeData.screen_name}>
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
                          `/explorer/races/${resolveFactionLinkid(activeData.faction)}/units/` +
                          activeData.id
                        }
                      >
                        <Avatar
                          src={activeData.icon_name}
                          alt={activeData.screen_name}
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
                        id={activeData.id}
                        ui={{
                          armorIcon: activeData.sbps.ui.armorIcon,
                        }}
                        health={{
                          armor: activeData.ebps_default.health.armorLayout.armor,
                          frontal: activeData.ebps_default.health.armorLayout.frontArmor,
                          rear: activeData.ebps_default.health.armorLayout.rearArmor,
                          side: activeData.ebps_default.health.armorLayout.sideArmor,
                          targetSize: activeData.ebps_default.health.targetSize,
                        }}
                        type={activeData.unit_type}
                        sight={{
                          coneAngle: 1,
                          outerRadius:
                            activeData.ebps_default.sight_ext.sight_package.outer_radius,
                        }}
                        moving={{
                          defaultSpeed:
                            activeData.ebps_default.moving_ext.speed_scaling_table.default_speed,
                          maxSpeed:
                            activeData.ebps_default.moving_ext.speed_scaling_table.max_speed,
                        }}
                        range={{
                          max: activeData.weapon_member[0].weapon.weapon_bag.range.max,
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
                      {HitpointCard({ squad: activeData.sbps, entities: ebpsStats })}
                    </Card>
                  </HoverCard.Dropdown>
                </HoverCard>

                <Text size="xs">{activeData.health} HP</Text>
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
                  variant={activeData.is_moving ? "default" : "trannsparent"}
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
                  variant={activeData.cover == "heavy" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("heavy")}
                >
                  <Image src="/icons/common/cover/heavy.png" alt="Heavy Cover"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Light Cover">
                <ActionIcon
                  size="lg"
                  variant={activeData.cover == "light" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("light")}
                >
                  <Image src="/icons/common/cover/light.png" alt="Light Cover"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Negative Cover">
                <ActionIcon
                  size="lg"
                  variant={activeData.cover == "negative" ? "default" : "trannsparent"}
                  onClick={() => onCoverChange("negative")}
                >
                  <Image src="/icons/common/cover/negative.png" alt="Negative Cover"></Image>
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Garrison">
                <ActionIcon
                  size="lg"
                  variant={activeData.cover == "garrison" ? "default" : "trannsparent"}
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
