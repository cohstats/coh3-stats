import { Divider, Flex, Grid, Group, Image, Space, Stack, Text, Title } from "@mantine/core";

// So have to split and make another card for the squad info like Sight Range,
// Speed (walking, driving), Range of Fire, Reload Time (for tanks), Armor
// (infantry)

// Plus the unkeep costs per minute (another card, below cost card), which
// probably requires a calculation, need to check

type UnitSquadInput = {
  id: string;
};

export const UnitSquadCard = ({ id }: UnitSquadInput) => {
  return (
    <Stack>
      <Title order={6} transform="uppercase">
        Squad Stats - {id}
      </Title>
      <Grid fz="sm" columns={12} align="center" gutter="xs" grow>
        <Grid.Col span={4}>
          <Text>Sight Range</Text>
        </Grid.Col>
        <Grid.Col span={2} offset={6}>
          <Text align="end">0</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Text>Speed</Text>
        </Grid.Col>
        <Grid.Col span={2} offset={6}>
          <Text align="end">0</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Text>Range of fire (ROF)</Text>
        </Grid.Col>
        <Grid.Col span={2} offset={6}>
          <Text align="end">0</Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Text>Armor (Infantry)</Text>
        </Grid.Col>
        <Grid.Col span={2} offset={6}>
          <Text align="end">0</Text>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
