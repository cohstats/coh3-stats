import { NextPage } from "next";
import { DpsComparePageComponent } from "../../components/unitStats/dps/dpsComparePageComponent";
import { EbpsType, getEbpsStats, setEbpsStats } from "../../src/unitStats/mappingEbps";
import { getSbpsStats, SbpsType, setSbpsStats } from "../../src/unitStats/mappingSbps";
import { setWeaponStats, WeaponType } from "../../src/unitStats/mappingWeapon";
import {
  getUpgradesStats,
  setUpgradesStats,
  UpgradesType,
} from "../../src/unitStats/mappingUpgrades";
import {
  AbilitiesType,
  getAbilitiesStats,
  setAbilitiesStats,
} from "../../src/unitStats/mappingAbilities";
import { setLocstring, unitStatsLocString } from "../../src/unitStats/locstring";
import React, { useEffect } from "react";
import { getMappings } from "../../src/unitStats/mappings";
import { AnalyticsDPSComparePageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { Center, Loader } from "@mantine/core";
import Head from "next/head";
import { generateNextSeo, NextSeoProps } from "next-seo/pages";
import { useTranslation } from "next-i18next/pages";
import config from "../../config";
import { getExplorerRoute, getDPSCompareRoute } from "../../src/routes";
import PageJsonLd from "../../components/page-json-ld";

interface DpsCompareProps {
  weaponData: WeaponType[];
  locstring: Record<string, string | null>;
}

const DpsComparePage: NextPage<DpsCompareProps> = ({ weaponData, locstring }) => {
  const { t } = useTranslation(["explorer"]);

  useEffect(() => {
    AnalyticsDPSComparePageView();
  }, []);

  const [isLoading, setIsLoading] = React.useState(true);
  const [sbpsData, setSbpsDataState] = React.useState<SbpsType[]>([]);
  const [ebpsData, setEbpsDataState] = React.useState<EbpsType[]>([]);
  const [upgradesData, setUpgradesDataState] = React.useState<UpgradesType[]>([]);
  const [abilitiesData, setAbilitiesDataState] = React.useState<AbilitiesType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!unitStatsLocString()) setLocstring(locstring);
        setWeaponStats(weaponData);

        const [ebpsData, sbpsData, upgradesData, abilitiesData] = await Promise.all([
          getEbpsStats("latest"),
          getSbpsStats("latest"),
          getUpgradesStats(),
          getAbilitiesStats(),
        ]);

        setEbpsStats(ebpsData);
        setSbpsStats(sbpsData);
        setUpgradesStats(upgradesData);
        setAbilitiesStats(abilitiesData);

        setEbpsDataState(ebpsData);
        setSbpsDataState(sbpsData);
        setUpgradesDataState(upgradesData);
        setAbilitiesDataState(abilitiesData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const dpsData = {
    weaponData,
    sbpsData,
    ebpsData,
    upgradesData,
    abilitiesData,
  };

  // Create SEO props for DPS Compare page
  const title = t("dpsCompare.meta.title");
  const description = t("dpsCompare.meta.description");
  const keywords = t("dpsCompare.meta.keywords", { returnObjects: true }) as string[];

  const seoProps: NextSeoProps = {
    title,
    description,
    canonical: `${config.SITE_URL}/explorer/dps-compare`,
    openGraph: {
      title,
      description,
      url: `${config.SITE_URL}/explorer/dps-compare`,
    },
    additionalMetaTags: [
      {
        name: "keywords",
        content: Array.isArray(keywords)
          ? keywords.concat(["coh3", "coh3stats", "Company of Heroes 3"]).join(", ")
          : "coh3, coh3stats, Company of Heroes 3",
      },
    ],
  };

  return (
    <>
      <Head>{generateNextSeo(seoProps)}</Head>
      <PageJsonLd
        path={getDPSCompareRoute()}
        name={title}
        description={description}
        trail={[{ name: t("common:mainMenu.explorer"), path: getExplorerRoute() }]}
      />
      <div>
        {isLoading && (
          <Center maw={400} h={250} mx="auto">
            <Loader />
          </Center>
        )}
        {!isLoading && <DpsComparePageComponent {...dpsData} />}
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  const { weaponData, locstring } = await getMappings();

  return {
    props: {
      weaponData: weaponData,
      locstring: locstring,
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
    },
  };
};

export default DpsComparePage;
