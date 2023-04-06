import { NextPage } from "next";
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
import React from "react";
import { generateKeywordsString } from "../../src/head-utils";
import { getMappings } from "../../src/unitStats/mappings";
import { UnitTable } from "../../components/unitStats/unitTable";

interface SquadProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  upgradesData: UpgradesType[];
  locstring: any;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const squadPage: NextPage<SquadProps> = ({
  weaponData,
  sbpsData,
  ebpsData,
  upgradesData,
  locstring,
}) => {
  // Save data again in global varible for clientMode
  if (!WeaponStats) setWeaponStats(weaponData);

  if (!ebpsStats) setEbpsStats(ebpsData);

  if (!upgradesStats) setUpgradesStats(upgradesData);

  if (!sbpsStats) setSbpsStats(sbpsData);

  if (!unitStatsLocString) setLocstring(locstring);

  const keywords = generateKeywordsString([
    "coh3 units",
    "unit browser",
    "coh3 unit browser",
    "coh3 unit overview",
    "unit overview",
    "squad browser",
    "coh3 squads",
    "coh3 squad browser",
    "coh3 squad overview",
    "tank browser",
    "coh3 tanks",
    "coh3 tank browser",
    "coh3 tank overview",
  ]);

  return (
    <>
      <Head>
        <title>COH3 Stats - Unit Browser</title>
        <meta name="description" content={"CoH-3 Unit Browser."} />
        <meta name="keywords" content={keywords} />
        {/*<meta property="og:image" content={"We might prepare a nice image for a preview for this page"} />*/}
      </Head>
      <div>
        <UnitTable sbpsData={sbpsData} ebpsData={ebpsData} weaponData={weaponData}></UnitTable>
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

export default squadPage;
