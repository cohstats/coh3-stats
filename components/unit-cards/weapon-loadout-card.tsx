import { Divider, Flex, Grid, Image, Indicator, Stack, Text, Title } from "@mantine/core";
import { getScatterArea, getWeaponRpm, WeaponStatsType } from "../../src/unitStats";
import { getDefaultWeaponIcon } from "../../src/unitStats/dpsCommon";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";

type WeaponCardInput = {
  id: string;
  icon_name: string; // icon path in game
  // faction: string;
  weapon_bag: WeaponStatsType;
  weapon_class: string;
  weapon_cat: string;
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
};

export const WeaponLoadoutCard = (
  { id, parent, icon_name, weapon_class, weapon_cat, weapon_bag }: WeaponCardInput,
  count = 1,
) => {
  const iconName = icon_name !== "" ? `/icons/${icon_name}.png` : getDefaultWeaponIcon(parent);
  /** Only take into account those weapons categories to display further info.
   * The "special", "flame_throwers", "campaign" are ignored. */
  const isValidWeapon =
    weapon_cat == "ballistic_weapon" ||
    weapon_cat == "explosive_weapon" ||
    weapon_cat == "small_arms";
  return (
    <Stack spacing={8}>
      {/* Heading */}
      <Flex align="center" gap={16}>
        <Indicator
          inline
          color="red"
          offset={4}
          position="top-start"
          size={20}
          label={count}
          withBorder
        >
          {icon_name !== "" ? (
            <ImageWithFallback
              width={48}
              height={16}
              src={iconName}
              alt={id}
              fallbackSrc={symbolPlaceholder}
            />
          ) : (
            <Image width={48} height={16} src={iconName} alt={id}></Image>
          )}
        </Indicator>
        <Flex direction="column">
          <Title order={6} fw="bold" transform="uppercase">
            {id.split("_").join(" ")}
          </Title>
          <Text fz="xs" fw="bold" transform="uppercase" color="orange.5">
            {weapon_class.split("_").join(" ")} - {weapon_cat.split("_").join(" ")}
          </Text>
        </Flex>
      </Flex>

      <Divider />

      <Stack spacing={2} fz="sm">
        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Moving Accuracy Multiplier</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {""}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="orange.6">
              {isValidWeapon ? weapon_bag.moving_accuracy_multiplier : ""}
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {""}
            </Text>
          </Grid.Col>
        </Grid>

        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Moving Cooldown Multiplier</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {""}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="orange.6">
              {isValidWeapon ? weapon_bag.moving_cooldown_multiplier : ""}
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {""}
            </Text>
          </Grid.Col>
        </Grid>

        <Divider my={8}></Divider>

        {/* Section Group Header */}
        <Grid gutter="xs">
          <Grid.Col md={4} span={4}></Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              Near
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="yellow.6">
              Mid
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              Far
            </Text>
          </Grid.Col>
        </Grid>

        {/* First row: Accuracy */}
        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Accuracy</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {weapon_bag.accuracy_near}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="yellow.6">
              {weapon_bag.accuracy_mid}
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {weapon_bag.accuracy_far}
            </Text>
          </Grid.Col>
        </Grid>

        {/* Second Row: RPM (rounds per minutes) */}

        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Rounds per minute (RPM)</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_near))}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="yellow.6">
              {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_mid))}
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_far))}
            </Text>
          </Grid.Col>
        </Grid>

        {/* Third Row: Range of fire */}

        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Range of Fire</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {weapon_bag.range.near}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="yellow.6">
              {weapon_bag.range.mid}
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {weapon_bag.range.max}
            </Text>
          </Grid.Col>
        </Grid>

        {/* These rows only apply if activeData.weapon.weapon_cat == "ballistic_weapon"
          || activeData.weapon.weapon_cat == "explosive_weapon" */}

        {/* Row: Penetration */}
        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Penetration</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {isValidWeapon ? weapon_bag.penetration_near : "-"}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="yellow.6">
              {isValidWeapon ? weapon_bag.penetration_mid : "-"}
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {isValidWeapon ? weapon_bag.penetration_far : "-"}
            </Text>
          </Grid.Col>
        </Grid>

        {/* Row: Scatter Area */}
        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Scatter Area</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {isValidWeapon
                ? Math.round(getScatterArea(weapon_bag.range.near, weapon_bag))
                : "-"}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="yellow.6">
              {isValidWeapon ? Math.round(getScatterArea(weapon_bag.range.mid, weapon_bag)) : "-"}
            </Text>
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {isValidWeapon ? Math.round(getScatterArea(weapon_bag.range.max, weapon_bag)) : "-"}
            </Text>
          </Grid.Col>
        </Grid>

        <Divider my={8}></Divider>

        {/* Section Group Header */}

        <Grid gutter="xs">
          <Grid.Col md={4} span={4}></Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              Min.
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            {/* <Text align="center" color="yellow.6">
            </Text> */}
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              Max.
            </Text>
          </Grid.Col>
        </Grid>

        {/* First row: Damage */}
        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>Damage</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {weapon_bag.damage_min}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            {/* <Text align="center" color="yellow.6">
              {"-"}
            </Text> */}
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {weapon_bag.damage_max}
            </Text>
          </Grid.Col>
        </Grid>

        {/* Third row: Area of effect */}

        <Grid gutter="xs">
          <Grid.Col md={4} span={4}>
            <Text>AoE Radius</Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            <Text align="center" color="green.6">
              {"-"}
            </Text>
          </Grid.Col>
          <Grid.Col md={3} span={3}>
            {/* <Text align="center" color="yellow.6">
              {"-"}
            </Text> */}
          </Grid.Col>
          <Grid.Col md={2} span={2}>
            <Text align="center" color="red.6">
              {weapon_bag.aoe_outer_radius}
            </Text>
          </Grid.Col>
        </Grid>

        {/* <Divider></Divider> */}
      </Stack>
    </Stack>
  );
};
