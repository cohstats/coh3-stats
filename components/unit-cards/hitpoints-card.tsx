import { Flex, Progress, Stack, Text, Title, Tooltip } from "@mantine/core";
import { EbpsType, SbpsType } from "../../src/unitStats";
import ImageWithFallback, { iconPlaceholder } from "../placeholders";

type HitpointsCardInput = {
  squad: SbpsType;
  entities: EbpsType[];
  title?: string;
};

const squadIcon = "/icons/common/squad/squad.png";
const weaponIcon = "/icons/races/common/symbols/hmg.png";
const colorPalette = ["cyan.6", "blue.6", "indigo.6", "violet.6", "grape.6", "pink.6", "red.6"];

export const HitpointCard = ({ squad, entities, title }: HitpointsCardInput) => {
  title = title || "Hitpoints";

  // Put the "team_weapon" type in this array.
  // const twEntities: EbpsType[] = [];
  // Only take into account the entities that are not a "team_weapon" type.
  // const squadEntities: EbpsType[] = [];

  let totalHitPoints = 0;
  let twTotalHitPoints = 0;
  const squadHitPoints = [];
  const twSquadHitPoints = [];

  for (const loadout of squad?.loadout || []) {
    const id = loadout.type.split("/").slice(-1)[0];
    const foundEntity = entities.find((x) => x.id === id);
    if (foundEntity) {
      // Push the entity hitpoints "num" times.
      for (let c = 0; c < loadout.num; c++) {
        // Patch 2.1.4, mortar are missing team_weapon unitType
        if (foundEntity.unitTypes.includes("team_weapon") || foundEntity.unitType === "mortar") {
          // twEntities.push(foundEntity);
          twTotalHitPoints += foundEntity.health.hitpoints;
          twSquadHitPoints.push(foundEntity.health.hitpoints);
        } else {
          // squadEntities.push(foundEntity);
          // This check is OK, there seems to be an error in the Relic data.
          if (typeof foundEntity.health.hitpoints === "number") {
            totalHitPoints += foundEntity.health.hitpoints;
          } else {
            console.warn(`Entity ${foundEntity.id} has no hitpoints as number`);
          }
          // We want to push it there even if it's not a number.
          squadHitPoints.push(foundEntity.health.hitpoints);
        }
      }
    }
  }

  // Display the first team weapon entity symbol as icon.
  const twHitPointsSection = (
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
        {twSquadHitPoints.map((hp, idx) => (
          <Progress.Section
            key={idx}
            value={(hp / twTotalHitPoints) * 100}
            color={colorPalette[idx]}
          >
            <Progress.Label>{hp.toString()}</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>

      <Text fw="bold" style={{ textAlign: "end" }}>
        {twTotalHitPoints}
      </Text>
    </Flex>
  );

  const squadHitPointsSection = (
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
        {squadHitPoints.map((hp, idx) => (
          <Progress.Section
            key={idx}
            value={(hp / totalHitPoints) * 100}
            color={colorPalette[idx]}
          >
            <Progress.Label>{hp.toString()}</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>

      <Text fw="bold" style={{ textAlign: "end" }}>
        {totalHitPoints}
      </Text>
    </Flex>
  );

  return (
    <Stack>
      <Title order={6} style={{ textTransform: "uppercase" }}>
        {title}
      </Title>
      <Tooltip label={"Squad hitpoints"} withArrow>
        {squadHitPointsSection}
      </Tooltip>
      {twSquadHitPoints.length ? (
        <Tooltip label={"Team weapon hitpoints"} withArrow>
          {twHitPointsSection}
        </Tooltip>
      ) : (
        <></>
      )}
    </Stack>
  );
};
