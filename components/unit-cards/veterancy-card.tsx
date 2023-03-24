import { Grid, Group, Image, Stack, Text, Title } from "@mantine/core";

const vetStarIconPath = "/icons/hud/decorators/vet_star.png";
const vetStarEmptyIconPath = "/icons/hud/decorators/vet_star_empty.png";

type VeterancyInput = {
  one: {
    exp: number;
    screenName: string;
  };
  two: {
    exp: number;
    screenName: string;
  };
  three: {
    exp: number;
    screenName: string;
  };
};

export const VeterancyCard = ({ one, two, three }: VeterancyInput) => {
  return (
    <Stack>
      <Title order={6} transform="uppercase">
        Veterancy
      </Title>
      <Grid fz="sm" justify="left" align="center" columns={6} grow gutter="sm">
        <Grid.Col span={1} md={2}>
          <Stack align="center" spacing="xs">
            <Group spacing={2} grow>
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarIconPath}
                alt="vet 1 star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarEmptyIconPath}
                alt="vet 1 empty star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarEmptyIconPath}
                alt="vet 1 empty star"
              />
            </Group>
            <Text>XP: {one.exp}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={5} md={4}>
          <Text>{one.screenName}</Text>
        </Grid.Col>

        <Grid.Col span={1} md={2}>
          <Stack align="center" spacing="xs">
            <Group spacing={2} grow>
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarIconPath}
                alt="vet 2 star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarIconPath}
                alt="vet 2 star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarEmptyIconPath}
                alt="vet 2 empty star"
              />
            </Group>
            <Text>XP: {two.exp}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={5} md={4}>
          <Text>{two.screenName}</Text>
        </Grid.Col>

        <Grid.Col span={1} md={2}>
          <Stack align="center" spacing="xs">
            <Group spacing={2} grow>
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarIconPath}
                alt="vet 3 star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarIconPath}
                alt="vet 3 star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarIconPath}
                alt="vet 3 star"
              />
            </Group>
            <Text>XP: {three.exp}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={5} md={4}>
          <Text>{three.screenName}</Text>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
