import { Box, Group, Image, List, ListItem, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { useTranslation } from "next-i18next/pages";

const vetStarIconPath = "/icons/hud/decorators/vet_star.png";
const vetStarEmptyIconPath = "/icons/hud/decorators/vet_star_empty.png";

type VeterancyLevelInput = {
  exp: number;
  screenName: string;
  requirement?: string;
  requirementIcon?: string;
};

type VeterancyInput = {
  one: VeterancyLevelInput;
  two: VeterancyLevelInput;
  three: VeterancyLevelInput;
  four?: VeterancyLevelInput;
  title?: string;
  layout?: "stacked" | "inline";
};

export const VeterancyCard = ({
  one,
  two,
  three,
  four,
  title,
  layout = "stacked",
}: VeterancyInput) => {
  const { t } = useTranslation(["explorer"]);

  title = title || t("unitPage.veterancy");
  const spaceRegex = /\\r?\\n|\\r|\\n/g;

  const levels = [
    { level: 1, data: one },
    { level: 2, data: two },
    { level: 3, data: three },
    ...(four ? [{ level: 4, data: four }] : []),
  ];

  const renderLevel = ({ level, data }: { level: number; data: VeterancyLevelInput }) => {
    const desc = data.screenName.split(spaceRegex);
    const maxStars = Math.max(3, level);
    const hasRequirement = Boolean(data.requirement);

    const starsBlock = (
      <Stack align="flex-start" gap={4}>
        <Group gap={2} justify="center" wrap="nowrap">
          {Array.from({ length: maxStars }, (_, index) => (
            <Image
              key={index}
              height={24}
              width={24}
              fit="contain"
              src={index < level ? vetStarIconPath : vetStarEmptyIconPath}
              alt={`vet ${level} ${index < level ? "star" : "empty star"}`}
              data-testid="vet-star"
            />
          ))}
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          XP: {data.exp}
        </Text>

        {data.requirement && (
          <Group gap={6} wrap="nowrap" align="center" justify="center">
            {data.requirementIcon && (
              <ImageWithFallback
                width={18}
                height={18}
                src={data.requirementIcon}
                alt="Veterancy requirement"
                fallbackSrc={symbolPlaceholder}
                style={{ flexShrink: 0 }}
              />
            )}

            <Text size="xs" c="dimmed" ta="center">
              {t("unitPage.requirements")}: {data.requirement}
            </Text>
          </Group>
        )}
      </Stack>
    );

    const descriptionList = (
      <List size="sm" listStyleType="disc" spacing={2}>
        {desc.map((item, index) => (
          <ListItem key={`${level}-${index}`}>{item}</ListItem>
        ))}
      </List>
    );

    return (
      <Box
        key={level}
        p={hasRequirement ? "sm" : 0}
        style={
          hasRequirement
            ? {
                border: "1px solid var(--mantine-color-dark-4)",
                borderRadius: "var(--mantine-radius-md)",
                height: "100%",
              }
            : { height: "100%" }
        }
      >
        {layout === "stacked" ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" verticalSpacing="sm">
            <Box>{starsBlock}</Box>
            <Box>{descriptionList}</Box>
          </SimpleGrid>
        ) : (
          <Stack gap="sm">
            {starsBlock}
            {descriptionList}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <Stack data-testid="veterancy-section" gap="sm">
      <Title order={6} style={{ textTransform: "uppercase" }} data-testid="veterancy-title">
        {title}
      </Title>

      {layout === "stacked" ? (
        <Stack gap="sm">{levels.map(({ level, data }) => renderLevel({ level, data }))}</Stack>
      ) : (
        <SimpleGrid
          cols={{ base: 1, sm: Math.min(levels.length, 2), md: Math.min(levels.length, 3) }}
          spacing="sm"
          verticalSpacing="sm"
        >
          {levels.map(({ level, data }) => renderLevel({ level, data }))}
        </SimpleGrid>
      )}
    </Stack>
  );
};
