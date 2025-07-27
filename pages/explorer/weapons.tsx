import { useEffect } from "react";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { getMappings } from "../../src/unitStats/mappings";
import { generateAlternateLanguageLinks, generateKeywordsString } from "../../src/seo-utils";
import { AnalyticsExplorerWeaponsView } from "../../src/firebase/analytics";
import { WeaponTable, WeaponTableRow } from "../../components/unitStats/weaponTable";
import { getScatterArea, getWeaponRpm } from "../../src/unitStats";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

interface WeaponsProps {
  tableData: WeaponTableRow[];
}

const keywords = generateKeywordsString(["coh3 challenges", "challenges"]);

const Weapons: NextPage<WeaponsProps> = ({ tableData }) => {
  const { asPath } = useRouter();

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
        {generateAlternateLanguageLinks(asPath)}
      </Head>
      <div>
        <WeaponTable inputData={tableData} />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";

  const { weaponData } = await getMappings(context.locale);

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

    /**
     * Only take into account those weapons categories to display further info.
     * The "special", "flame_throwers", "campaign" are ignored.
     * This is the same logic as weapon-loadout-card. */
    const isValidWeapon =
      row.weapon_cat == "ballistic_weapon" ||
      row.weapon_cat == "explosive_weapon" ||
      row.weapon_cat == "small_arms";

    tableData.push({
      id: row.id,
      faction: row.faction,
      type: row.weapon_class,
      icon_name: row.icon_name || null,
      screen_name: row.ui_name || `(*) ${row.id}`,
      mv_accu_mul: isValidWeapon ? row.weapon_bag.moving_accuracy_multiplier : "-",
      mv_cd_mul: isValidWeapon ? row.weapon_bag.moving_cooldown_multiplier : "-",
      accu_near: row.weapon_bag.accuracy_near,
      accu_mid: row.weapon_bag.accuracy_mid,
      accu_far: row.weapon_bag.accuracy_far,
      rpm_near:
        Math.round(getWeaponRpm(row.weapon_bag, row.weapon_bag.range_distance_near)) || "-",
      rpm_mid: Math.round(getWeaponRpm(row.weapon_bag, row.weapon_bag.range_distance_mid)) || "-",
      rpm_far: Math.round(getWeaponRpm(row.weapon_bag, row.weapon_bag.range_distance_far)) || "-",
      range_near: row.weapon_bag.range?.near || "-",
      range_mid: row.weapon_bag.range?.mid || "-",
      range_far: row.weapon_bag.range?.far || "-",
      pen_near: isValidWeapon ? row.weapon_bag.penetration_near : "-",
      pen_mid: isValidWeapon ? row.weapon_bag.penetration_mid : "-",
      pen_far: isValidWeapon ? row.weapon_bag.penetration_far : "-",
      sct_near: isValidWeapon
        ? Math.round(getScatterArea(row.weapon_bag.range.near, row.weapon_bag))
        : "-",
      sct_mid: isValidWeapon
        ? Math.round(getScatterArea(row.weapon_bag.range.mid, row.weapon_bag))
        : "-",
      sct_far: isValidWeapon
        ? Math.round(getScatterArea(row.weapon_bag.range.far, row.weapon_bag))
        : "-",
      dmg_min: row.weapon_bag.damage_min,
      dmg_max: row.weapon_bag.damage_max,
      aoe_damage_near: row.weapon_bag.aoe_damage_near,
      aoe_damage_mid: row.weapon_bag.aoe_damage_mid,
      aoe_damage_far: row.weapon_bag.aoe_damage_far,
    });
  }

  // console.log("🚀 ~ constgetStaticProps:GetStaticProps= ~ categoryList:", categoryList);
  // console.log(Object.keys(categoryList));

  return {
    props: {
      tableData: tableData,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default Weapons;
