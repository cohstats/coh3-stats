import { useEffect } from "react";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { getMappings } from "../../src/unitStats/mappings";
import { generateKeywordsString } from "../../src/head-utils";
import { AnalyticsExplorerWeaponsView } from "../../src/firebase/analytics";
import {
  getWeaponClassIcon,
  WeaponTable,
  WeaponTableRow,
} from "../../components/unitStats/weaponTable";
import { getFactionIcon } from "../../src/unitStats";
import { getIconsPathOnCDN } from "../../src/utils";

interface WeaponsProps {
  tableData: WeaponTableRow[];
}

const keywords = generateKeywordsString(["coh3 challenges", "challenges"]);

const Weapons: NextPage<WeaponsProps> = ({ tableData }) => {
  useEffect(() => {
    AnalyticsExplorerWeaponsView();
  }, []);

  return (
    <>
      <Head>
        <title>COH3 Stats - Weapons</title>
        <meta
          name="description"
          content={"CoH 3 Weapons list. Browser through all the weapons in-game."}
        />
        <meta name="keywords" content={keywords} />
        {/*we might prepare better image*/}
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <div>
        <WeaponTable inputData={tableData} />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { weaponData } = await getMappings();

  const tableData: WeaponTableRow[] = [];
  // const categoryList: Record<string, number> = {};

  for (const row of weaponData) {
    // categoryList[row.weapon_class] ??= 0;
    // categoryList[row.weapon_class] += 1;

    if (
      // !row.ui_name || !row.icon_name ||
      ["common", "dev"].includes(row.faction)
    ) {
      continue;
    }

    tableData.push({
      id: row.id,
      faction: row.faction,
      type: row.weapon_class,
      type_icon: getIconsPathOnCDN(getWeaponClassIcon(row.weapon_class)),
      faction_icon: getFactionIcon(row.faction),
      icon_name: row.icon_name
        ? getIconsPathOnCDN("icons/" + row.icon_name)
        : getIconsPathOnCDN("icons/common/weapons/placeholder_weapon.png"),
      screen_name: row.ui_name || `(*) ${row.id}`,
      accuracy_near: row.weapon_bag.accuracy_near,
      accuracy_mid: row.weapon_bag.accuracy_mid,
      accuracy_far: row.weapon_bag.accuracy_far,
    });
  }

  // console.log("🚀 ~ constgetStaticProps:GetStaticProps= ~ categoryList:", categoryList);
  // console.log(Object.keys(categoryList));

  return {
    props: {
      tableData: tableData,
    },
  };
};

export default Weapons;
