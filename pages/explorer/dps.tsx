import { NextPage } from "next";
import { DpsPageComponent } from "../../components/unitStats/dps/dpsPageComponent";
import { EbpsType, getEbpsStats, setEbpsStats } from "../../src/unitStats/mappingEbps";
import { getSbpsStats, SbpsType, setSbpsStats } from "../../src/unitStats/mappingSbps";
import { setWeaponStats, WeaponType } from "../../src/unitStats/mappingWeapon";
import { setLocstring, unitStatsLocString } from "../../src/unitStats/locstring";
import React, { useEffect } from "react";
import { getMappings } from "../../src/unitStats/mappings";
import { AnalyticsDPSExplorerPageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Center, Loader } from "@mantine/core";
import { NextSeo } from "next-seo";
import { useTranslation } from "next-i18next";
import config from "../../config";

interface DpsProps {
  weaponData: WeaponType[];
  // sbpsData: SbpsType[];
  // ebpsData: EbpsType[];
  locstring: Record<string, string | null>;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const DpsPage: NextPage<DpsProps> = ({ weaponData, locstring }) => {
  const { t } = useTranslation(["explorer"]);

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

  // Create SEO props for DPS calculator page
  const title = t("dps.meta.title");
  const description = t("dps.meta.description");
  const keywords = t("dps.meta.keywords", { returnObjects: true }) as string[];

  const seoProps = {
    title,
    description,
    canonical: `${config.SITE_URL}/explorer/dps`,
    openGraph: {
      title,
      description,
      url: `${config.SITE_URL}/explorer/dps`,
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
        {!isLoading && <DpsPageComponent {...dbpsData} />}
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
