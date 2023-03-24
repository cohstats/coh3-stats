import { Flex, Grid, Progress, Stack, Text, Title } from "@mantine/core";
import { EbpsType, SbpsType } from "../../src/unitStats";
import ImageWithFallback, { iconPlaceholder } from "../placeholders";

type HitpointsCardInput = {
  squad: SbpsType;
  entities: EbpsType[];
};

const squadIcon = "/icons/common/squad/squad.png";
const colorPalette = ["cyan.6", "blue.6", "indigo.6", "violet.6", "grape.6", "pink.6", "red.6"];

export const HitpointCard = ({ squad, entities }: HitpointsCardInput) => {
  const hitpoints: number[] = [];
  for (const loadout of squad?.loadout || []) {
    const id = loadout.type.split("/").slice(-1)[0];
    const foundEntity = entities.find((x) => x.id === id);
    if (foundEntity) {
      // Push the entity hitpoints "num" times.
      for (let c = 0; c < loadout.num; c++) {
        hitpoints.push(foundEntity.health.hitpoints);
      }
    }
  }

  const total = hitpoints.reduce((acc, x) => x + acc, 0);

  return (
    <Stack>
      <Title order={6} transform="uppercase">
        Hitpoints
      </Title>
      <Flex align="center" gap={16}>
        <ImageWithFallback
          width={32}
          height={32}
          src={squadIcon}
          alt="squad entity icon"
          fallbackSrc={iconPlaceholder}
        />
        <Progress
          w="100%"
          size={24}
          sections={hitpoints.map((hp, idx) => ({
            value: (hp / total) * 100,
            color: colorPalette[idx],
            label: hp.toString(),
          }))}
        />
        <Text>{total}</Text>
      </Flex>
    </Stack>
  );
};
