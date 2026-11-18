import { useRouter } from "next/router";
import { NextPage } from "next";
import { DpsComparePageComponent } from "../../components/unitStats/dps/dpsComparePageComponent";
import { useEffect } from "react";
import { useDpsData } from "../../components/unitStats/dps/useDpsData";
import { DpsDataError } from "../../components/unitStats/dps/components/DpsDataError";
import { AnalyticsDPSComparePageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { Center, Loader } from "@mantine/core";
import Head from "next/head";
import { generateNextSeo, NextSeoProps } from "next-seo/pages";
import { useTranslation } from "next-i18next/pages";
import { getLocalizedUrl } from "../../src/seo-utils";
import { getExplorerRoute, getDPSCompareRoute } from "../../src/routes";
import PageJsonLd from "../../components/page-json-ld";

const DpsComparePage: NextPage = () => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation(["explorer"]);

  useEffect(() => {
    AnalyticsDPSComparePageView();
  }, []);

  const { data: dpsData, error, isLoading, retry } = useDpsData();

  // Create SEO props for DPS Compare page
  const title = t("dpsCompare.meta.title");
  const description = t("dpsCompare.meta.description");
  const keywords = t("dpsCompare.meta.keywords", {
    returnObjects: true,
  }) as string[];

  const seoProps: NextSeoProps = {
    title,
    description,
    canonical: getLocalizedUrl("/explorer/dps-compare", locale),
    openGraph: {
      title,
      description,
      url: getLocalizedUrl("/explorer/dps-compare", locale),
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
        {error && <DpsDataError onRetry={retry} />}
        {isLoading && (
          <Center maw={400} h={250} mx="auto">
            <Loader />
          </Center>
        )}
        {dpsData && <DpsComparePageComponent {...dpsData} />}
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
    },
  };
};

export default DpsComparePage;
