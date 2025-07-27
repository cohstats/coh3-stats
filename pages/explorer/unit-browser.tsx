import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { generateAlternateLanguageLinks, generateKeywordsString } from "../../src/seo-utils";
import { getMappings } from "../../src/unitStats/mappings";
import { UnitTable } from "../../components/unitStats/unitTable";
import { AnalyticsExplorerUnitBrowserView } from "../../src/firebase/analytics";
import { CustomizableUnit, mapCustomizableUnit } from "../../src/unitStats/dpsCommon";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

interface SquadProps {
  tableData: CustomizableUnit[];
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitBrowser: NextPage<SquadProps> = ({ tableData }) => {
  const { asPath } = useRouter();

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
            "CoH 3 Unit Browser. Browser through all the game units in the game and see their stats in a table."
          }
        />
        <meta name="keywords" content={keywords} />
        {generateAlternateLanguageLinks(asPath)}
        {/*<meta property="og:image" content={"We might prepare a nice image for a preview for this page"} />*/}
      </Head>
      <div>
        <UnitTable inputData={tableData} />
      </div>
    </>
  );
};

// These are the keys of the data we want to display in the table
// These keys should be the same as in the unitTable.tsx file
const dataKeys = [
  "id", // it's used for key in the table
  "faction", // is used for filtering
  "unit_type", // is used for filtering
  "faction_icon",
  "type_icon",
  "icon_name",
  "screen_name",
  "cost_mp",
  "cost_fuel",
  "cost_pop",
  "cost_reinforce",
  "upkeep_mp",
  "capture_rate",
  "capture_revert",
  "health",
  "target_size",
  "armor",
  "sight_range",
  "dps_n",
  "dps_m",
  "dps_f",
  "range",
  "penetration",
  "speed",
];
const filterObject = (obj: any, allowedKeys: string[]): any => {
  const filteredObj: any = {};
  const keys = Object.keys(obj);

  for (const key of keys) {
    if (allowedKeys.includes(key)) {
      filteredObj[key] = obj[key];
    }
  }

  return filteredObj;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";

  // map Data at built time
  const { weaponData, ebpsData, sbpsData } = await getMappings(locale);

  const tableData: CustomizableUnit[] = [];

  for (const sbps of sbpsData) {
    const unit = mapCustomizableUnit(sbps, ebpsData, weaponData);
    if (
      unit.screen_name != "No text found" &&
      unit.screen_name != null &&
      sbps.ui.screenName != null &&
      sbps.ui.symbolIconName != "" &&
      sbps.faction != "british" &&
      unit.cost_mp > 0
    ) {
      tableData.push(filterObject(unit, dataKeys));
    }
  }

  return {
    props: {
      tableData: tableData,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default UnitBrowser;
