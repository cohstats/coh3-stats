import { Grid, Group, Image, List, ListItem, Stack, Text, Title } from "@mantine/core";

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
  title?: string;
};

export const VeterancyCard = ({ one, two, three, title }: VeterancyInput) => {
  title = title || "Veterancy";
  const spaceRegex = /\\r?\\n|\\r|\\n/g;

  const oneDesc = one.screenName.split(spaceRegex);
  const twoDesc = two.screenName.split(spaceRegex);
  const threeDesc = three.screenName.split(spaceRegex);

  return (
    <Stack data-testid="veterancy-section">
      <Title order={6} style={{ textTransform: "uppercase" }} data-testid="veterancy-title">
        {title}
      </Title>
      <Grid fz="sm" justify="left" align="center" columns={6} grow gutter="sm">
        <Grid.Col span={{ base: 1, md: 2 }}>
          <Stack align="center" gap="xs">
            <Group gap={2} grow>
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarIconPath}
                alt="vet 1 star"
                data-testid="vet-star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarEmptyIconPath}
                alt="vet 1 empty star"
                data-testid="vet-star"
              />
              <Image
                height={24}
                width={24}
                fit="contain"
                src={vetStarEmptyIconPath}
                alt="vet 1 empty star"
                data-testid="vet-star"
              />
            </Group>
            <Text>XP: {one.exp}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 5, md: 4 }}>
          <List size="sm">
            {oneDesc.map((x, index) => (
              <ListItem key={index}>{x}</ListItem>
            ))}
          </List>
        </Grid.Col>

        <Grid.Col span={{ base: 1, md: 2 }}>
          <Stack align="center" gap="xs">
            <Group gap={2} grow>
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
        <Grid.Col span={{ base: 5, md: 4 }}>
          <List size="sm">
            {twoDesc.map((x, index) => (
              <ListItem key={index}>{x}</ListItem>
            ))}
          </List>
        </Grid.Col>

        <Grid.Col span={{ base: 1, md: 2 }}>
          <Stack align="center" gap="xs">
            <Group gap={2} grow>
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
        <Grid.Col span={{ base: 5, md: 4 }}>
          <List size="sm">
            {threeDesc.map((x, index) => (
              <ListItem key={index}>{x}</ListItem>
            ))}
          </List>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
