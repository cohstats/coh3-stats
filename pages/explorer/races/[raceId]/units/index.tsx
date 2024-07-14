import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { IconBarrierBlock } from "@tabler/icons-react";
import { Anchor, Card, Flex, Grid, Stack, Text, Title, Container } from "@mantine/core";

import { raceType } from "../../../../../src/coh3/coh3-types";
import { generateKeywordsString } from "../../../../../src/head-utils";
import { localizedNames } from "../../../../../src/coh3/coh3-data";
import { getMappings } from "../../../../../src/unitStats/mappings";
import { RaceBagDescription, SbpsType } from "../../../../../src/unitStats";
import FactionIcon from "../../../../../components/faction-icon";
import { UnitDescriptionCard } from "../../../../../components/unit-cards/unit-description-card";
import LinkWithOutPrefetch from "../../../../../components/LinkWithOutPrefetch";
import { getExplorerUnitRoute } from "../../../../../src/routes";
import { useEffect } from "react";
import { AnalyticsExplorerFactionUnitsView } from "../../../../../src/firebase/analytics";

interface UnitDetailProps {
  units: SbpsType[];
  raceToFetch: raceType;
}

const ExplorerUnits: NextPage<UnitDetailProps> = ({ units, raceToFetch }) => {
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
        <Stack>
          <Flex direction="row" align="center" gap="md">
            <FactionIcon name={raceToFetch} width={64} />
            <Title order={2}>{localizedRace}</Title>
          </Flex>

          <Text size="lg">{RaceBagDescription[raceToFetch]}</Text>
        </Stack>

        <Flex direction="row" align="center" gap={16} mt={24}>
          <IconBarrierBlock size={50} />
          <Text c="orange.6"  fs="italic">
            Important Note: This section displays all the units available in-game, including
            campaign-only.
          </Text>
        </Flex>

        <Stack mt={32}>
          <Title order={4}>Units</Title>

          <Grid>
            {units.map(({ id, ui }) => {
              if (ui.screenName) {
                return (
                  <Grid.Col key={id} span={{xs: 12, md: 6}}>
                    <Anchor
                      c="undefined"
                      underline={"never"}
                      sx={{
                        "&:hover": {
                          textDecoration: "none",
                        },
                      }}
                      component={LinkWithOutPrefetch}
                      href={getExplorerUnitRoute(raceToFetch, id)}
                    >
                      <Card p="md" radius="md" withBorder>
                        <UnitDescriptionCard
                          faction={raceToFetch}
                          desc={{
                            screen_name: ui.screenName,
                            help_text: ui.helpText,
                            brief_text: ui.briefText,
                            symbol_icon_name: ui.symbolIconName,
                            icon_name: ui.iconName,
                          }}
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
  const { sbpsData } = await getMappings();

  const raceId = context.params?.raceId as string;

  const raceToFetch = (raceId as raceType) || "american";
  const faction = raceToFetch === "dak" ? "afrika_korps" : raceToFetch;
  const units = sbpsData.filter((squad: SbpsType) => squad.faction.includes(faction));

  return {
    props: {
      raceToFetch,
      units,
    },
  };
};

export const getStaticPaths: GetStaticPaths<{ unitId: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export default ExplorerUnits;
