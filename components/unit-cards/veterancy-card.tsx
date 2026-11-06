import {
  Box,
  Grid,
  Group,
  Image,
  List,
  ListItem,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { useTranslation } from "next-i18next/pages";

const vetStarIconPath = "/icons/hud/decorators/vet_star.png";
const vetStarEmptyIconPath = "/icons/hud/decorators/vet_star_empty.png";

type VeterancyModifierInput = {
  id: string;
  value: number;
};

const readableModifierName = (id: string) =>
  id
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

type VeterancyLevelInput = {
  exp: number;
  screenName: string;
  requirement?: string;
  requirementIcon?: string;
  modifiers?: VeterancyModifierInput[];
};

type VeterancyInput = {
  one: VeterancyLevelInput;
  two: VeterancyLevelInput;
  three: VeterancyLevelInput;
  four?: VeterancyLevelInput;
  title?: string;
};

export const VeterancyCard = ({ one, two, three, four, title }: VeterancyInput) => {
  const { t } = useTranslation(["explorer"]);

  title = title || t("unitPage.veterancy");
  const spaceRegex = /\\r?\\n|\\r|\\n/g;

  const levels = [
    { level: 1, data: one },
    { level: 2, data: two },
    { level: 3, data: three },
    ...(four ? [{ level: 4, data: four }] : []),
  ];

  return (
    <Stack data-testid="veterancy-section">
      <Title order={6} style={{ textTransform: "uppercase" }} data-testid="veterancy-title">
        {title}
      </Title>

      <Grid fz="sm" justify="left" align="center" columns={6} grow gap="sm">
        {levels.map(({ level, data }) => {
          const desc = data.screenName.split(spaceRegex);
          const maxStars = Math.max(3, level);
          const hasRequirement = Boolean(data.requirement);

          return (
            <Grid.Col key={level} span={6}>
              <Tooltip
                disabled={!data.modifiers?.length}
                position="top"
                withArrow
                multiline
                w={320}
                events={{ hover: true, focus: true, touch: true }}
                label={
                  <Stack gap={6}>
                    {data.modifiers?.map(({ id, value }, index) => (
                      <Group
                        key={`${id}-${index}`}
                        gap="sm"
                        wrap="nowrap"
                        justify="space-between"
                      >
                        <Text size="xs" style={{ overflowWrap: "anywhere" }}>
                          {readableModifierName(id)}
                        </Text>
                        <Text size="xs" fw={600} style={{ flexShrink: 0 }}>
                          {value}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                }
              >
                <Box
                  tabIndex={data.modifiers?.length ? 0 : undefined}
                  p={hasRequirement ? "xs" : 0}
                  style={{
                    ...(hasRequirement
                      ? {
                          border: "1px solid var(--mantine-color-dark-4)",
                          borderRadius: "var(--mantine-radius-md)",
                        }
                      : {}),
                    cursor: data.modifiers?.length ? "help" : undefined,
                  }}
                >
                  <Grid fz="sm" justify="left" align="center" columns={6} grow gap="sm">
                    <Grid.Col span={{ base: 1, md: 2 }}>
                      <Stack align="center" gap="xs">
                        <Group gap={2} grow>
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

                        <Text>XP: {data.exp}</Text>
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 5, md: 4 }}>
                      <Stack gap="xs">
                        {data.requirement && (
                          <Group gap={6} wrap="nowrap">
                            {data.requirementIcon && (
                              <ImageWithFallback
                                width={22}
                                height={22}
                                src={data.requirementIcon}
                                alt="Veterancy requirement"
                                fallbackSrc={symbolPlaceholder}
                                style={{ flexShrink: 0 }}
                              />
                            )}

                            <Text size="xs" c="dimmed">
                              {t("unitPage.requirements")}: {data.requirement}
                            </Text>
                          </Group>
                        )}

                        <List size="sm">
                          {desc.map((x, index) => (
                            <ListItem key={index}>{x}</ListItem>
                          ))}
                        </List>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Box>
              </Tooltip>
            </Grid.Col>
          );
        })}
      </Grid>
    </Stack>
  );
};
