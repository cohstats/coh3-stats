import { useRouter } from "next/router";
import { NextPage } from "next";
import { DpsPageComponent } from "../../components/unitStats/dps/dpsPageComponent";
import { useEffect } from "react";
import { useDpsData } from "../../components/unitStats/dps/useDpsData";
import { DpsDataError } from "../../components/unitStats/dps/components/DpsDataError";
import { EMPTY_DPS_DATA } from "../../src/unitStats/dpsData";
import { AnalyticsDPSExplorerPageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import Head from "next/head";
import { generateNextSeo, NextSeoProps } from "next-seo/pages";
import { useTranslation } from "next-i18next/pages";
import { getLocalizedUrl } from "../../src/seo-utils";
import { getExplorerRoute, getDPSCalculatorRoute } from "../../src/routes";
import PageJsonLd from "../../components/page-json-ld";

const DpsPage: NextPage = () => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation(["explorer"]);

  useEffect(() => {
    AnalyticsDPSExplorerPageView();
  }, []);

  const { data: dpsData, error, isLoading, retry } = useDpsData();

  // Create SEO props for DPS calculator page
  const title = t("dps.meta.title");
  const description = t("dps.meta.description");
  const keywords = t("dps.meta.keywords", { returnObjects: true }) as string[];

  const seoProps: NextSeoProps = {
    title,
    description,
    canonical: getLocalizedUrl("/explorer/dps", locale),
    openGraph: {
      title,
      description,
      url: getLocalizedUrl("/explorer/dps", locale),
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
        path={getDPSCalculatorRoute()}
        name={title}
        description={description}
        breadcrumbName={t("common:mainMenu.explMenu.dpsCalculator")}
        trail={[{ name: t("common:mainMenu.explorer"), path: getExplorerRoute() }]}
      />
      {/* Render the full layout right away (instead of a small loader) to avoid layout shift */}
      {error ? (
        <DpsDataError onRetry={retry} />
      ) : (
        <DpsPageComponent
          key={dpsData ? dpsData.patch : "loading"}
          {...(dpsData ?? EMPTY_DPS_DATA)}
          isLoading={isLoading}
        />
      )}
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

export default DpsPage;
