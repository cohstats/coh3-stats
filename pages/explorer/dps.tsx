import { NextPage } from "next";
import { DpsChart } from "../../components/unitStats/dps/dpsChart";
import { EbpsType, getEbpsStats, setEbpsStats } from "../../src/unitStats/mappingEbps";
import { getSbpsStats, SbpsType, setSbpsStats } from "../../src/unitStats/mappingSbps";
import { setWeaponStats, WeaponType } from "../../src/unitStats/mappingWeapon";
import { setLocstring, unitStatsLocString } from "../../src/unitStats/locstring";
import Head from "next/head";
import React, { useEffect } from "react";
import { generateAlternateLanguageLinks, generateKeywordsString } from "../../src/head-utils";
import { getMappings } from "../../src/unitStats/mappings";
import { AnalyticsDPSExplorerPageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Center, Loader } from "@mantine/core";
import { useRouter } from "next/router";

interface DpsProps {
  weaponData: WeaponType[];
  // sbpsData: SbpsType[];
  // ebpsData: EbpsType[];
  locstring: Record<string, string | null>;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const DpsPage: NextPage<DpsProps> = ({ weaponData, locstring }) => {
  const { asPath } = useRouter();

  useEffect(() => {
    AnalyticsDPSExplorerPageView();
  }, []);

  const [isLoading, setIsLoading] = React.useState(true);
  const [sbpsData, setSbpsDataState] = React.useState<SbpsType[]>([]);
  const [ebpsData, setEbpsDataState] = React.useState<EbpsType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!unitStatsLocString) setLocstring(locstring);
        setWeaponStats(weaponData);

        const [ebpsData, sbpsData] = await Promise.all([
          getEbpsStats("latest"),
          getSbpsStats("latest"),
        ]);

        setEbpsStats(ebpsData);
        setSbpsStats(sbpsData);
        setSbpsDataState(sbpsData);
        setEbpsDataState(ebpsData);
        // Save data again in global variable for clientMode
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const dbpsData = {
    weaponData: weaponData,
    sbpsData: sbpsData,
    ebpsData: ebpsData,
  };

  const keywords = generateKeywordsString([
    "coh3 dps",
    "dps tools",
    "coh3 dps calculator",
    "coh3 units calculator",
    "coh3 damage calculator",
    "damage per second coh3",
  ]);

  return (
    <>
      <Head>
        <title>COH3 Stats - DPS Calculator</title>
        <meta
          name="description"
          content={
            "DPS Calculator for all units. Calculate with types of covers." +
            "Setup different squad combinations, weapons and much more."
          }
        />
        <meta name="keywords" content={keywords} />
        {generateAlternateLanguageLinks(asPath)}
        {/*<meta property="og:image" content={"We might prepare a nice image for a preview for this page"} />*/}
      </Head>
      <div>
        {isLoading && (
          <Center maw={400} h={250} mx="auto">
            <Loader />
          </Center>
        )}
        {!isLoading && <DpsChart {...dbpsData} />}
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  // map Data at built time
  const { weaponData, locstring } = await getMappings();

  return {
    props: {
      weaponData: weaponData,
      locstring: locstring,
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
    },
  };
};

export default DpsPage;
