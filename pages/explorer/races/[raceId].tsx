import { GetStaticPaths, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, Container, Flex, Image, Stack, Text, Title } from "@mantine/core";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { raceType } from "../../../src/coh3/coh3-types";
import {
  BuildingCard,
  BuildingSchema,
} from "../../../components/unit-cards/building-description-card";
import { fetchLocstring } from "../../../src/unitStats/locstring";
import { EbpsType, getEbpsStats } from "../../../src/unitStats/mappingEbps";
import { SbpsType, getSbpsStats } from "../../../src/unitStats/mappingSbps";
import { UpgradesType, getUpgradesStats } from "../../../src/unitStats/mappingUpgrades";
import { WeaponType, getWeaponStats } from "../../../src/unitStats/mappingWeapon";

const RaceBagDescription: Record<raceType, string> = {
  // Locstring value: $11234530
  german:
    "A steadfast and elite force that can hold against even the most stubborn foe. Unlock unique arsenals to specialize your forces.",
  // Locstring value: $11234529
  american:
    "Versatile infantry and weaponry that can displace any opponent. Experience is key to improving your forces for the fight ahead.",
  // Locstring value: $11220490
  dak: "A combined-arms force of aggressive vehicles, plentiful reinforcements and stubborn tanks that can break down any enemy line.",
  // Locstring value: $11234532
  british:
    "Infantry and team weapons form a backbone that is tough to break. Myriad vehicles will create the opening you need to seize the day.",
};

interface RaceDetailProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  upgradesData: UpgradesType[];
  locstring: Record<string, string>;
}

const RaceDetail: NextPage<RaceDetailProps> = ({ ebpsData }) => {
  console.log("🚀 ~ file: [raceId].tsx:39 ~ spbsData:", ebpsData);
  // The `query` contains the `raceId`, which is the filename as route slug.
  const { query } = useRouter();

  const raceToFetch: raceType = (query.raceId as raceType) || "american";
  const localizedRace = localizedNames[raceToFetch];
  const iconFaction = raceToFetch === "dak" ? "afrika_korps" : raceToFetch;

  return (
    <>
      <Head>
        <title>{localizedRace} - COH3 Explorer</title>
        <meta name="description" content={`${localizedRace} - COH3 Explorer`} />
      </Head>
      <Container size="md">
        <Stack>
          <Flex direction="row" align="center" gap="md">
            <Image
              height={64}
              width={64}
              fit="contain"
              src={`/icons/common/races/${iconFaction}.png`}
              alt={localizedRace}
            />
            <Title order={2}>{localizedRace}</Title>
          </Flex>

          <Text size="lg">{RaceBagDescription[raceToFetch]}</Text>
        </Stack>

        {/* Buildings Section */}
        <Stack mt={32}>
          <Title order={4}>Buildings</Title>
          <Text>This is an example building card list.</Text>

          {BuildingMapping(ebpsData, iconFaction)}
        </Stack>
      </Container>
    </>
  );
};

const BuildingMapping = (
  ebpsData: EbpsType[],
  race: "german" | "american" | "british" | "afrika_korps",
) => {
  // const sampleUnits: BuildingSchema["units"] = [
  //   {
  //     desc: {
  //       id: "m13_40_ak",
  //       screen_name: "Carro Armato M13/40 Light Tank",
  //       brief_text: "Light tank armed with a 47mm gun and three Breda 38 machine guns.",
  //       help_text: "Anti-infantry / Anti-vehicle",
  //       icon_name: "races\\afrika_corps\\vehicles\\m13_40_ak",
  //       symbol_icon_name: "races\\german\\symbols\\m13_40_ger",
  //     },
  //     time_cost: {
  //       manpower: 240,
  //       fuel: 120,
  //     },
  //   },
  //   {
  //     desc: {
  //       id: "l6_40_ak",
  //       screen_name: "L6/40 Light Tank",
  //       brief_text: "Light tank armed with a 20mm autocannon.",
  //       help_text: "Anti-infantry",
  //       icon_name: "races\\afrika_corps\\vehicles\\l6_40_ak",
  //       symbol_icon_name: "races\\afrika_corps\\symbols\\l6_40_ak",
  //     },
  //     time_cost: {
  //       manpower: 280,
  //       munition: 15,
  //       fuel: 40,
  //     },
  //   },
  // ];
  const filteredBuildings = ebpsData.filter(
    (entity) => entity.faction === race && entity.unitType === "production",
  );
  return (
    <>
      {filteredBuildings.map((building) => (
        <Card key={building.id} p="sm" radius="md" withBorder>
          <BuildingCard
            // @todo: Validate types.
            type={"hq"}
            desc={{
              screen_name: building.ui.screenName,
              help_text: building.ui.helpText,
              extra_text: building.ui.extraText,
              brief_text: building.ui.briefText,
              icon_name: building.ui.iconName,
            }}
            units={[]}
            time_cost={{
              manpower: 500.0,
              time_seconds: 15.0,
            }}
            upgrades={[]}
          ></BuildingCard>
        </Card>
      ))}
    </>
  );
};

// Generates `/dak`.
export const getStaticPaths: GetStaticPaths<{ raceId: string }> = async () => {
  return {
    paths: [
      { params: { raceId: "dak" } },
      { params: { raceId: "american" } },
      { params: { raceId: "british" } },
      { params: { raceId: "german" } },
    ],
    fallback: false, // can also be true or 'blocking'
  };
};

export const getStaticProps = async () => {
  const locstring = await fetchLocstring();

  // map Data at built time
  const weaponData = await getWeaponStats();

  // map Data at built time
  const ebpsData = await getEbpsStats();

  // map Data at built time
  const sbpsData = await getSbpsStats();

  // map Data at built time
  const upgradesData = await getUpgradesStats();

  return {
    props: {
      weaponData,
      sbpsData,
      ebpsData,
      upgradesData,
      locstring,
    },
  };
};

export default RaceDetail;
