import { Flex, Progress, Stack, Text, Title, Tooltip } from "@mantine/core";
import { EbpsType, SbpsType } from "../../src/unitStats";
import ImageWithFallback, { iconPlaceholder } from "../placeholders";

type HitpointsCardInput = {
  squad: SbpsType;
  entities: EbpsType[];
};

const squadIcon = "/icons/common/squad/squad.png";
const weaponIcon = "/icons/races/common/symbols/hmg.png";
const colorPalette = ["cyan.6", "blue.6", "indigo.6", "violet.6", "grape.6", "pink.6", "red.6"];

export const HitpointCard = ({ squad, entities }: HitpointsCardInput) => {
  // Put the "team_weapon" type in this array.
  const twEntities: EbpsType[] = [];
  // Only take into account the entities that are not a "team_weapon" type.
  const squadEntities: EbpsType[] = [];
  for (const loadout of squad?.loadout || []) {
    const id = loadout.type.split("/").slice(-1)[0];
    const foundEntity = entities.find((x) => x.id === id);
    if (foundEntity) {
      // Push the entity hitpoints "num" times.
      for (let c = 0; c < loadout.num; c++) {
        if (foundEntity.unitTypes.includes("team_weapon")) {
          twEntities.push(foundEntity);
        } else {
          squadEntities.push(foundEntity);
        }
      }
    }
  }

  const totalHitpoints = squadEntities.reduce((acc, x) => acc + x.health.hitpoints, 0);
  const squadHitpoints = squadEntities.map((x) => x.health.hitpoints);
  const twTotalHitpoints = twEntities.reduce((acc, x) => acc + x.health.hitpoints, 0);
  const twSquadHitpoints = twEntities.map((x) => x.health.hitpoints);

  // Display the first team weapon entity symbol as icon.
  const twHitpointsSection = (
    <Flex direction="row" align="center" gap="md">
      <Stack align="center">
        <ImageWithFallback
          width={32}
          height={32}
          src={weaponIcon}
          alt="squad team weapon icon"
          fallbackSrc={iconPlaceholder}
        />
      </Stack>

      <Progress.Root w="100%" size={24}>
        {twSquadHitpoints.map((hp, idx) => (
          <Progress.Section key={idx} value={(hp / twTotalHitpoints) * 100} color={colorPalette[idx]}>
            <Progress.Label>{hp.toString()}</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>

      <Text fw="bold" style={{"textAlign": "end"}}>
        {twTotalHitpoints}
      </Text>
    </Flex>
  );

  const squadHitpointsSection = (
    <Flex direction="row" align="center" gap="md">
      <Stack align="center">
        <ImageWithFallback
          width={32}
          height={32}
          src={squadIcon}
          alt="squad icon"
          fallbackSrc={iconPlaceholder}
        />
      </Stack>

      <Progress.Root w="100%" size={24}>
        {squadHitpoints.map((hp, idx) => (
          <Progress.Section key={idx} value={(hp / totalHitpoints) * 100} color={colorPalette[idx]}>
            <Progress.Label>{hp.toString()}</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>

      <Text fw="bold" style={{"textAlign": "end"}}>
        {totalHitpoints}
      </Text>
    </Flex>
  );

  return (
    <Stack>
      <Title order={6} style={{"textTransform": "uppercase"}}>
        Hitpoints
      </Title>
      <Tooltip label={"Squad hitpoints"} withArrow>
        {squadHitpointsSection}
      </Tooltip>
      {twEntities.length ? (
        <Tooltip label={"Team weapon hitpoints"} withArrow>
          {twHitpointsSection}
        </Tooltip>
      ) : (
        <></>
      )}
    </Stack>
  );
};
