import { NextPage } from "next";
import { DpsChart } from "../../components/unitStats/dpsChart";
import { ebpsStats, EbpsType, setEbpsStats } from "../../src/unitStats/mappingEbps";
import { sbpsStats, SbpsType, setSbpsStats } from "../../src/unitStats/mappingSbps";
import { setWeaponStats, WeaponStats, WeaponType } from "../../src/unitStats/mappingWeapon";
import {
  setUpgradesStats,
  upgradesStats,
  UpgradesType,
} from "../../src/unitStats/mappingUpgrades";
import { setLocstring, unitStatsLocString } from "../../src/unitStats/locstring";
import Head from "next/head";
import React, { useEffect } from "react";
import { generateKeywordsString } from "../../src/head-utils";
import { getMappings } from "../../src/unitStats/mappings";
import { AnalyticsDPSExplorerPageView } from "../../src/firebase/analytics";

interface DpsProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  upgradesData: UpgradesType[];
  locstring: any;
  generalInfo: any;
  properties: any;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const DpsPage: NextPage<DpsProps> = ({
  weaponData,
  sbpsData,
  ebpsData,
  upgradesData,
  locstring,
}) => {
  useEffect(() => {
    AnalyticsDPSExplorerPageView();
  }, []);

  // Save data again in global varible for clientMode
  if (!WeaponStats) setWeaponStats(weaponData);

  if (!ebpsStats) setEbpsStats(ebpsData);

  if (!upgradesStats) setUpgradesStats(upgradesData);

  if (!sbpsStats) setSbpsStats(sbpsData);

  if (!unitStatsLocString) setLocstring(locstring);

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
            "DPS Calculator for all units. Calculate with types of covers. " +
            "Setup different squad combinations, weapons and much more."
          }
        />
        <meta name="keywords" content={keywords} />
        {/*<meta property="og:image" content={"We might prepare a nice image for a preview for this page"} />*/}
      </Head>
      <div>
        <DpsChart {...dbpsData} />
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  // map Data at built time
  const { weaponData, ebpsData, sbpsData, upgradesData, locstring } = await getMappings();

  return {
    props: {
      weaponData: weaponData,
      sbpsData: sbpsData,
      ebpsData: ebpsData,
      upgradesData: upgradesData,
      locstring: locstring,
    },
  };
};

export default DpsPage;
