import { Box, Grid, Group, Image, List, ListItem, Stack, Text, Title } from "@mantine/core";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { useTranslation } from "next-i18next";

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
    <Stack>
      <Title order={6} style={{ textTransform: "uppercase" }}>
        {title}
      </Title>

      <Grid fz="sm" justify="left" align="center" columns={6} grow gutter="sm">
        {levels.map(({ level, data }) => {
          const desc = data.screenName.split(spaceRegex);
          const maxStars = Math.max(3, level);
          const hasRequirement = Boolean(data.requirement);

          return (
            <Grid.Col key={level} span={6}>
              <Box
                p={hasRequirement ? "xs" : 0}
                style={
                  hasRequirement
                    ? {
                        border: "1px solid var(--mantine-color-dark-4)",
                        borderRadius: "var(--mantine-radius-md)",
                      }
                    : undefined
                }
              >
                <Grid fz="sm" justify="left" align="center" columns={6} grow gutter="sm">
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
            </Grid.Col>
          );
        })}
      </Grid>
    </Stack>
  );
};
