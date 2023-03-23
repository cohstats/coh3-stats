import { GetStaticPaths, NextPage } from "next";
import Head from "next/head";
import Error from "next/error";
import { useRouter } from "next/router";
import { Flex, Grid, Space, Stack, Text, Title } from "@mantine/core";
import ContentContainer from "../../../../../components/Content-container";
import {
  EbpsType,
  fetchLocstring,
  getEbpsStats,
  getSbpsStats,
  RaceBagDescription,
  SbpsType,
} from "../../../../../src/unitStats";
import { UnitDescriptionCard } from "../../../../../components/unit-cards/unit-description-card";
import FactionIcon from "../../../../../components/faction-icon";
import { raceType } from "../../../../../src/coh3/coh3-types";
import { localizedNames } from "../../../../../src/coh3/coh3-data";
import {
  StatsVehicleArmor,
  VehicleArmorType,
} from "../../../../../components/unit-cards/vehicle-armor-card";

interface UnitDetailProps {
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  locstring: Record<string, string>;
}

const UnitDetail: NextPage<UnitDetailProps> = ({ sbpsData, ebpsData }) => {
  const { query } = useRouter();

  const unitId = query.unitId as string;
  const raceId = query.raceId as raceType;

  const resolvedSquad = sbpsData.find((x) => x.id === unitId);
  const resolvedEntity = ebpsData.find((x) => x.id === unitId);
  console.log("🚀 ~ file: [unitId].tsx:35 ~ resolvedSquad:", resolvedSquad);
  console.log("🚀 ~ file: [unitId].tsx:35 ~ resolvedEntity:", resolvedEntity);

  if (!resolvedSquad || !resolvedEntity) {
    // How to redirect back?
    return <Error statusCode={404} title="Unit Not Found" />;
  }

  const localizedRace = localizedNames[raceId];
  const descriptionRace = RaceBagDescription[raceId];

  return (
    <>
      <Head>
        <title>{resolvedSquad.ui.screenName} - COH3 Explorer</title>
        <meta name="description" content={`${resolvedSquad.ui.screenName} - COH3 Explorer`} />
      </Head>
      <ContentContainer>
        <Space h={32}></Space>
        <Flex direction="row" align="center" gap="md">
          <FactionIcon name={raceId} width={96}></FactionIcon>
          <Stack spacing="xs">
            <Title order={4}>{localizedRace}</Title>
            <Text size="lg">{descriptionRace}</Text>
          </Stack>
        </Flex>
        <Space h={32}></Space>
        <Grid columns={3}>
          <Grid.Col md={2}>
            <UnitDescriptionCard
              screen_name={resolvedSquad.ui.screenName}
              help_text={resolvedSquad.ui.helpText}
              brief_text={resolvedSquad.ui.briefText}
              symbol_icon_name={resolvedSquad.ui.symbolIconName}
              icon_name={resolvedSquad.ui.iconName}
            ></UnitDescriptionCard>
          </Grid.Col>
          <Grid.Col md={1}>
            {resolvedSquad.unitType === "vehicles" ? (
              <StatsVehicleArmor
                type={resolvedSquad.ui.armorIcon as VehicleArmorType}
                armorValues={{
                  frontal: resolvedEntity.health.armorLayout.frontArmor,
                  side: resolvedEntity.health.armorLayout.sideArmor,
                  rear: resolvedEntity.health.armorLayout.rearArmor,
                }}
              ></StatsVehicleArmor>
            ) : (
              <></>
            )}
          </Grid.Col>
        </Grid>
      </ContentContainer>
    </>
  );
};

export const getStaticProps = async () => {
  const locstring = await fetchLocstring();
  const ebpsData = await getEbpsStats();
  const sbpsData = await getSbpsStats();

  return {
    props: {
      sbpsData,
      ebpsData,
      locstring,
    },
  };
};

export const getStaticPaths: GetStaticPaths<{ unitId: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export default UnitDetail;
