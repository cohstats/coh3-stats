import { NextSeo } from "next-seo";
import { NextPage } from "next";
import {
  Anchor,
  Card,
  Container,
  Flex,
  Grid,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { raceType } from "../../src/coh3/coh3-types";
import { localizedNames } from "../../src/coh3/coh3-data";
import FactionIcon from "../../components/faction-icon";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import {
  getChallengesRoute,
  getDPSCalculatorRoute,
  getDPSCompareRoute,
  getExplorerFactionRoute,
  getExplorerFactionUnitsRoute,
  getUnitBrowserRoute,
  getWeaponsRoute,
} from "../../src/routes";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import { createPageSEO } from "../../src/seo-utils";
import { getIconsPathOnCDN } from "../../src/utils";

const Races: raceType[] = ["german", "american", "dak", "british"];

// Reusable InfoCard component for tool links
const InfoCard = ({
  link,
  title,
  description,
  imageSrc,
}: {
  link: string;
  title: string;
  description: string;
  imageSrc: string;
}) => {
  return (
    <Anchor
      component={LinkWithOutPrefetch}
      href={link}
      style={{ textDecoration: "none", height: "100%" }}
    >
      <Card p="sm" radius="md" withBorder style={{ height: "100%" }}>
        <Stack gap="xs" style={{ height: "100%" }}>
          <Flex justify="space-between" align="center" wrap="nowrap">
            <Title order={4} style={{ flex: 1 }}>
              {title}
            </Title>
            <Image
              w={30}
              h={30}
              fit="contain"
              src={imageSrc}
              alt=""
              fallbackSrc={"https://placehold.co/30x30?text=X"}
              style={{ flexShrink: 0 }}
            />
          </Flex>
          <Text size="sm" c="dimmed" style={{ flex: 1 }}>
            {description}
          </Text>
        </Stack>
      </Card>
    </Anchor>
  );
};

const Explorer: NextPage = () => {
  const { t } = useTranslation(["explorer"]);

  // Create SEO props for explorer page
  const seoProps = createPageSEO(t, "explorer", "/explorer");

  return (
    <>
      <NextSeo {...seoProps} />
      <Container size="md">
        <Stack mb={24}>
          <Title order={1}>{t("explorer.title")}</Title>
          <Text size="lg" mt={4}>
            {t("explorer.subtitle")}
          </Text>
        </Stack>

        <Stack gap="xl">
          {/* Battlegroups & Buildings Section */}
          <Stack gap="md">
            <Title order={2}>Battlegroups & Buildings</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {Races.map((faction: raceType) => {
                return (
                  <Anchor
                    key={`explorer_${faction}`}
                    c="undefined"
                    underline={"never"}
                    component={LinkWithOutPrefetch}
                    href={getExplorerFactionRoute(faction)}
                  >
                    <Card p="sm" radius="md" withBorder>
                      <Flex direction="row" justify="space-between" align="center">
                        <Flex direction="row" align="center" gap="md">
                          <FactionIcon name={faction} width={64} />
                          <Title order={3} size="h4" fw="bold">
                            {localizedNames[faction]}
                          </Title>
                        </Flex>
                        <IconChevronRight size={16} />
                      </Flex>
                    </Card>
                  </Anchor>
                );
              })}
            </SimpleGrid>
          </Stack>

          {/* Units Section */}
          <Stack gap="md">
            <Title order={2}>Units</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {Races.map((faction: raceType) => {
                return (
                  <Anchor
                    key={`explorer_units_${faction}`}
                    c="undefined"
                    underline={"never"}
                    component={LinkWithOutPrefetch}
                    href={getExplorerFactionUnitsRoute(faction)}
                  >
                    <Card p="sm" radius="md" withBorder>
                      <Flex direction="row" justify="space-between" align="center">
                        <Flex direction="row" align="center" gap="md">
                          <FactionIcon name={faction} width={64} />
                          <Title order={3} size="h4" fw="bold">
                            {localizedNames[faction]} Units
                          </Title>
                        </Flex>
                        <IconChevronRight size={16} />
                      </Flex>
                    </Card>
                  </Anchor>
                );
              })}
            </SimpleGrid>
          </Stack>

          {/* DPS Tools Section */}
          <Stack gap="md">
            <Title order={2}>DPS Tools</Title>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoCard
                  link={getDPSCalculatorRoute()}
                  title="DPS Calculator"
                  description="Calculate and analyze damage per second for individual units and weapons."
                  imageSrc={getIconsPathOnCDN("/icons/races/common/symbols/hmg.png")}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoCard
                  link={getDPSCompareRoute()}
                  title="DPS Comparison"
                  description="Compare damage output between multiple units side by side to find the best choices."
                  imageSrc={getIconsPathOnCDN("/icons/races/common/symbols/hmg.png")}
                />
              </Grid.Col>
            </Grid>
          </Stack>

          {/* Tools Section */}
          <Stack gap="md">
            <Title order={2}>Browser Tools</Title>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoCard
                  link={getUnitBrowserRoute()}
                  title="All Units"
                  description="Browse and search through all units in the game with detailed statistics."
                  imageSrc="/unitStats/weaponClass/supportinfantry_icn.png"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoCard
                  link={getWeaponsRoute()}
                  title="All Weapons"
                  description="Explore all weapons available in the game with their complete stats."
                  imageSrc={getIconsPathOnCDN(
                    "/icons/unit_status/bw2/generic_infantry_boost.png",
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <InfoCard
                  link={getChallengesRoute()}
                  title="Challenges"
                  description="View all daily and weekly challenges with completion requirements."
                  imageSrc="/icons/common/resources/resource_skill_points.png"
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
    },
  };
};

export default Explorer;
