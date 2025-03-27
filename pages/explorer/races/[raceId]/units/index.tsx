import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { IconBarrierBlock } from "@tabler/icons-react";
import { Anchor, Card, Flex, Grid, Stack, Text, Title, Container } from "@mantine/core";

import { raceType } from "../../../../../src/coh3/coh3-types";
import { generateKeywordsString } from "../../../../../src/head-utils";
import { localizedNames } from "../../../../../src/coh3/coh3-data";
import { getMappings } from "../../../../../src/unitStats/mappings";
import { SbpsType } from "../../../../../src/unitStats";
import FactionIcon from "../../../../../components/faction-icon";
import { UnitDescriptionCard } from "../../../../../components/unit-cards/unit-description-card";
import LinkWithOutPrefetch from "../../../../../components/LinkWithOutPrefetch";
import { getExplorerUnitRoute } from "../../../../../src/routes";
import { useEffect } from "react";
import { AnalyticsExplorerFactionUnitsView } from "../../../../../src/firebase/analytics";
import { getUnitStatsCOH3Descriptions } from "../../../../../src/unitStats/descriptions";

interface UnitDetailProps {
  units: SbpsType[];
  raceToFetch: raceType;
  descriptions: Record<string, Record<string, string>>;
}

const ExplorerUnits: NextPage<UnitDetailProps> = ({ units, raceToFetch, descriptions }) => {
  const localizedRace = localizedNames[raceToFetch];

  useEffect(() => {
    AnalyticsExplorerFactionUnitsView(raceToFetch);
  }, []);

  const metaKeywords = generateKeywordsString([
    `${localizedRace} coh3`,
    `Unit List ${localizedRace}`,
  ]);

  return (
    <>
      <Head>
        <title>{`${localizedRace} Units - COH3 Explorer`}</title>
        <meta name="description" content={`${localizedRace} Units - COH3 Explorer`} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:image" content={`/icons/general/${raceToFetch}.webp`} />
      </Head>
      <Container fluid p={0}>
        <Flex direction="row" align="center" gap="md">
          <FactionIcon name={raceToFetch} width={80}></FactionIcon>
          <Stack gap="xs">
            <Title order={3}>{localizedRace}</Title>
            <Text size="md">{descriptions[raceToFetch].description}</Text>
          </Stack>
        </Flex>

        <Flex direction="row" align="center" gap={16} mt={24}>
          <IconBarrierBlock size={50} />
          <Text c="orange.6" fs="italic">
            Important Note: This section displays all the units available in-game, including
            campaign-only.
          </Text>
        </Flex>

        <Stack mt={32}>
          <Title order={4}>{descriptions.common.units}</Title>

          <Grid>
            {units.map(({ id, ui }) => {
              if (ui.screenName) {
                return (
                  <Grid.Col key={id} span={{ xs: 12, md: 6 }}>
                    <Anchor
                      c="undefined"
                      underline={"never"}
                      style={{
                        "&:hover": {
                          textDecoration: "none",
                        },
                      }}
                      component={LinkWithOutPrefetch}
                      href={getExplorerUnitRoute(raceToFetch, id)}
                    >
                      <Card p={{ base: "xs", sm: "md" }} radius="md" withBorder>
                        <UnitDescriptionCard
                          faction={raceToFetch}
                          desc={{
                            screen_name: ui.screenName,
                            help_text: ui.helpText,
                            brief_text: ui.briefText,
                            symbol_icon_name: ui.symbolIconName,
                            icon_name: ui.iconName,
                          }}
                          list
                        />
                      </Card>
                    </Anchor>
                  </Grid.Col>
                );
              } else {
                return null;
              }
            })}
          </Grid>
        </Stack>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { sbpsData } = await getMappings(context.locale);

  const raceId = context.params?.raceId as string;

  const raceToFetch = (raceId as raceType) || "american";
  const faction = raceToFetch === "dak" ? "afrika_korps" : raceToFetch;
  const units = sbpsData.filter((squad: SbpsType) => squad.faction.includes(faction));

  return {
    props: {
      raceToFetch,
      units,
      descriptions: getUnitStatsCOH3Descriptions(context.locale),
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths<{ unitId: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export default ExplorerUnits;
