import { NextPage } from "next";
import { DpsComparePageComponent } from "../../components/unitStats/dps/dpsComparePageComponent";
import { EbpsType, getEbpsStats, setEbpsStats } from "../../src/unitStats/mappingEbps";
import { getSbpsStats, SbpsType, setSbpsStats } from "../../src/unitStats/mappingSbps";
import { setWeaponStats, WeaponType } from "../../src/unitStats/mappingWeapon";
import { setLocstring, unitStatsLocString } from "../../src/unitStats/locstring";
import React, { useEffect } from "react";
import { getMappings } from "../../src/unitStats/mappings";
import { AnalyticsDPSComparePageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Center, Loader } from "@mantine/core";
import { NextSeo } from "next-seo";
import { useTranslation } from "next-i18next";
import config from "../../config";

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!unitStatsLocString()) setLocstring(locstring);
        setWeaponStats(weaponData);

        const [ebpsData, sbpsData] = await Promise.all([
          getEbpsStats("latest"),
          getSbpsStats("latest"),
        ]);

        setEbpsStats(ebpsData);
        setSbpsStats(sbpsData);
        setSbpsDataState(sbpsData);
        setEbpsDataState(ebpsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const dpsData = {
    weaponData: weaponData,
    sbpsData: sbpsData,
    ebpsData: ebpsData,
  };

  // Create SEO props for DPS Compare page
  const title = t("dpsCompare.meta.title");
  const description = t("dpsCompare.meta.description");
  const keywords = t("dpsCompare.meta.keywords", { returnObjects: true }) as string[];

  const seoProps = {
    title,
    description,
    canonical: `${config.SITE_URL}/explorer/dps-compare`,
    openGraph: {
      title,
      description,
      url: `${config.SITE_URL}/explorer/dps-compare`,
      type: "website" as const,
      images: [
        {
          url: `${config.SITE_URL}/logo/android-icon-192x192.png`,
          width: 192,
          height: 192,
          alt: "COH3 Stats logo",
        },
      ],
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
      <NextSeo {...seoProps} />
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
