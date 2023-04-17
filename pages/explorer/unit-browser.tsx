import { NextPage } from "next";
import { EbpsType } from "../../src/unitStats/mappingEbps";
import { SbpsType } from "../../src/unitStats/mappingSbps";
import { WeaponType } from "../../src/unitStats/mappingWeapon";
import { UpgradesType } from "../../src/unitStats/mappingUpgrades";
import Head from "next/head";
import React, { useEffect } from "react";
import { generateKeywordsString } from "../../src/head-utils";
import { getMappings } from "../../src/unitStats/mappings";
import { UnitTable } from "../../components/unitStats/unitTable";
import { AnalyticsExplorerUnitBrowserView } from "../../src/firebase/analytics";

interface SquadProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  upgradesData: UpgradesType[];
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitBrowser: NextPage<SquadProps> = ({ weaponData, sbpsData, ebpsData }) => {
  useEffect(() => {
    AnalyticsExplorerUnitBrowserView();
  }, []);

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
        <meta
          name="description"
          content={
            "CoH 3 Unit Browser. Browser through all the units in the game and see their stats in a nice table."
          }
        />
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
  const { weaponData, ebpsData, sbpsData, upgradesData } = await getMappings();

  return {
    props: {
      weaponData: weaponData,
      sbpsData: sbpsData,
      ebpsData: ebpsData,
      upgradesData: upgradesData,
    },
  };
};

export default UnitBrowser;
