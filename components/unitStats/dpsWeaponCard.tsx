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
  HoverCard,
  Card,
} from "@mantine/core";
import { WeaponMember } from "../../src/unitStats/dpsCommon";
import { WeaponLoadoutCard } from "../unit-cards/weapon-loadout-card";
import { Line } from "react-chartjs-2";

interface IDPSProps {
  weapon_member: WeaponMember;
  onNumberChange: any;
  onDeleteMember: any;
}

const config = {
  type: "line",
  data: [],
  plugins: {
    legend: {
      position: "top",
      display: false,
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      min: 0,
      suggestedMax: 35,
      title: {
        display: false,
      },

      grid: {
        lineWidth: 0.5,
        display: false,
      },
    },
  },
};

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

  const lineData = {
    // labels: labels,
    datasets: [
      {
        label: "My First Dataset",
        data: activeData.dps_default,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

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
          <HoverCard shadow="md" width={400} position="left" offset={50}>
            <HoverCard.Target>
              <Group>
                <Image
                  width={60}
                  height={30}
                  src={props.weapon_member.image}
                  fit="contain"
                  alt={activeData.weapon_id.substring(0, 10)}
                />
                <CloseButton aria-label="Close modal" onClick={onDeleteWeapon} />
              </Group>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Card p="lg" radius="md">
                {WeaponLoadoutCard(activeData.weapon, 1)}
              </Card>
              <Line
                key={activeData.weapon_id}
                data={lineData}
                options={config as any}
                redraw
              ></Line>
              {/* <Stack mb={12}>
                <Space></Space>

                <Text>{activeData.weapon_id}</Text>
                <Divider my="sm" />
                <Grid gutter="xs">
                  <Grid.Col md={4} span={4}>
                    Accuracy:
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {weapon_bag.accuracy_near}
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {weapon_bag.accuracy_mid}
                  </Grid.Col>
                  <Grid.Col md={2} span={2}>
                    {weapon_bag.accuracy_far}
                  </Grid.Col>
                </Grid>

                <Grid gutter="xs">
                  <Grid.Col md={4} span={4}>
                    RPM:
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_near))}
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_mid))}
                  </Grid.Col>
                  <Grid.Col md={2} span={2}>
                    {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_far))}
                  </Grid.Col>
                </Grid>

                <Grid gutter="xs">
                  <Grid.Col md={4} span={4}>
                    Damage:
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {weapon_bag.damage_min} - {weapon_bag.damage_max}
                  </Grid.Col>
                  <Grid.Col md={3} span={3}></Grid.Col>
                  <Grid.Col md={2} span={2}></Grid.Col>
                </Grid>
                {(activeData.weapon.weapon_cat == "ballistic_weapon" ||
                  activeData.weapon.weapon_cat == "explosive_weapon") && (
                  <>
                    <Grid gutter="xs">
                      <Grid.Col md={4} span={4}>
                        Penetration:{" "}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {weapon_bag.penetration_near}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {weapon_bag.penetration_mid}
                      </Grid.Col>
                      <Grid.Col md={2} span={2}>
                        {weapon_bag.penetration_far}
                      </Grid.Col>
                    </Grid>

                    <Grid gutter="xs">
                      <Grid.Col md={4} span={4}>
                        Scatter Area:
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {Math.round(getScatterArea(weapon_bag.range.near, weapon_bag))}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {Math.round(getScatterArea(weapon_bag.range.mid, weapon_bag))}
                      </Grid.Col>
                      <Grid.Col md={2} span={2}>
                        {Math.round(getScatterArea(weapon_bag.range.far, weapon_bag))}
                      </Grid.Col>
                    </Grid>
                    <Grid gutter="xs">
                      <Grid.Col md={4} span={4}>
                        AoE Radius:
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {weapon_bag.aoe_outer_radius}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}></Grid.Col>
                      <Grid.Col md={2} span={2}></Grid.Col>
                    </Grid>
                  </>
                )}
              </Stack> */}
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>
        {/* <Group>
          <Image
            width={60}
            height={30}
            src={props.weapon_member.image}
            fit="contain"
            alt={activeData.weapon_id}
          />
          <CloseButton aria-label="Close modal" onClick={onDeleteWeapon} />
        </Group> */}

        <Text size="xs">{activeData.weapon_id.substring(0, 12) + "..."}</Text>
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
