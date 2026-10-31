import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import React, { useEffect } from "react";
import { generateLanguageAlternates, generateKeywordsString } from "../../src/seo-utils";
import { getMappings } from "../../src/unitStats/mappings";
import { UnitTable } from "../../components/unitStats/unitTable";
import { AnalyticsExplorerUnitBrowserView } from "../../src/firebase/analytics";
import { CustomizableUnit, mapCustomizableUnit } from "../../src/unitStats/dpsCommon";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import config from "../../config";
import { getUnitBrowserRoute } from "../../src/routes";
import ExplorerJsonLd from "../../components/explorer-json-ld";

interface SquadProps {
  tableData: CustomizableUnit[];
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitBrowser: NextPage<SquadProps> = ({ tableData }) => {
  const path = getUnitBrowserRoute();

  useEffect(() => {
    AnalyticsExplorerUnitBrowserView();
  }, []);

  const pageTitle = "Unit Browser";
  const description =
    "CoH 3 Unit Browser. Browser through all the game units in the game and see their stats in a table.";
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
        {generateNextSeo({
          title: pageTitle,
          description,
          canonical: `${config.SITE_URL}${path}`,
          // We might prepare a nice image for a preview for this page, until then the default logo is used
          openGraph: {
            title: pageTitle,
            description,
            url: `${config.SITE_URL}${path}`,
          },
          additionalMetaTags: [
            {
              name: "keywords",
              content: keywords,
            },
          ],
          languageAlternates: generateLanguageAlternates(path),
        })}
      </Head>
      <ExplorerJsonLd path={path} name={pageTitle} description={description} />
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
