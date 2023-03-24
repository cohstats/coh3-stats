import slash from "slash";
import { Divider, Flex, Group, Image, Space, Stack, Text, Title } from "@mantine/core";
import { WeaponStatsType } from "../../src/unitStats";
import { getDefaultWeaponIcon } from "../../src/unitStats/dpsCommon";

type WeaponCardInput = {
  id: string;
  icon_name: string; // icon path in game
  // faction: string;
  weapon_bag: WeaponStatsType;
  weapon_class: string;
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
};

export const WeaponLoadoutCard = ({
  id,
  parent,
  icon_name,
  weapon_class,
  weapon_bag,
}: WeaponCardInput) => {
  const iconName =
    icon_name !== "" ? `/icons/${slash(icon_name)}.png` : getDefaultWeaponIcon(parent);
  return (
    <Stack>
      <Flex align="center" gap={16}>
        <Image width={48} height={16} src={iconName} alt={id}></Image>
        <Flex direction="column">
          <Text fw="bold" transform="capitalize">
            {id.split("_").join(" ")}
          </Text>
          <Text fz="xs" fw={700} transform="capitalize">
            {weapon_class.split("_").join(" ")}
          </Text>
        </Flex>
      </Flex>
      <Divider></Divider>
      <Stack>
        <Title order={5}>Accuracy</Title>
        <Stack spacing={4} fz="sm">
          <Flex justify="space-between" align="center" gap={8}>
            <Text fw="bold" color="green.6">
              Near
            </Text>
            <Text fw="bold" color="green.6">
              {weapon_bag.accuracy_near}
            </Text>
          </Flex>
          <Flex justify="space-between" align="center" gap={8}>
            <Text fw="bold" color="yellow.6">
              Mid
            </Text>
            <Text fw="bold" color="yellow.6">
              {weapon_bag.accuracy_mid}
            </Text>
          </Flex>
          <Flex justify="space-between" align="center" gap={8}>
            <Text fw="bold" color="red.6">
              Far
            </Text>
            <Text fw="bold" color="red.6">
              {weapon_bag.accuracy_far}
            </Text>
          </Flex>
        </Stack>
      </Stack>
    </Stack>
  );
};
