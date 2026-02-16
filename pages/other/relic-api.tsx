import { NextPage } from "next";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import config from "../../config";
import { generateKeywordsString } from "../../src/seo-utils";
import { useRouter } from "next/router";
import { AnalyticsRelicApiPageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import "@scalar/api-reference-react/style.css";

// Custom dark theme CSS to match COH3 Stats website colors
const customCss = `
  .dark-mode {
    /* Main text colors - matching Mantine dark theme */
    --scalar-color-1: #ffffff;
    --scalar-color-2: rgba(255, 255, 255, 0.65);
    --scalar-color-3: rgba(255, 255, 255, 0.45);

    /* Accent color - Mantine blue */
    --scalar-color-accent: #339af0;

    /* Background colors - Mantine dark palette */
    --scalar-background-1: #242424;
    --scalar-background-2: #25262b;
    --scalar-background-3: #2c2e33;
    --scalar-background-accent: rgba(51, 154, 240, 0.12);

    /* Border color */
    --scalar-border-color: #2c2e33;
  }

  /* Sidebar styling */
  .dark-mode .sidebar {
    --scalar-sidebar-background-1: #242424;
    --scalar-sidebar-item-hover-color: currentColor;
    --scalar-sidebar-item-hover-background: #25262b;
    --scalar-sidebar-item-active-background: #2c2e33;
    --scalar-sidebar-border-color: #2c2e33;
    --scalar-sidebar-color-1: #ffffff;
    --scalar-sidebar-color-2: rgba(255, 255, 255, 0.65);
    --scalar-sidebar-color-active: #339af0;
    --scalar-sidebar-search-background: #25262b;
    --scalar-sidebar-search-border-color: #2c2e33;
    --scalar-sidebar-search-color: rgba(255, 255, 255, 0.45);
  }
`;

// Dynamic import to avoid SSR issues with Scalar
const ApiReferenceReact = dynamic(
  () => import("@scalar/api-reference-react").then((mod) => mod.ApiReferenceReact),
  { ssr: false },
);

const RelicApiDocs: NextPage = () => {
  const { asPath } = useRouter();

  const pageTitle = "COH3 Stats - Relic API Documentation";
  const description = "Unofficial documentation for the Relic Company of Heroes 3 Community API.";
  const keywords = generateKeywordsString([
    "coh3 api",
    "relic api",
    "coh3 leaderboards api",
    "coh3 match history api",
  ]);

  // Analytics tracking
  useEffect(() => {
    AnalyticsRelicApiPageView();
  }, []);

  return (
    <div>
      <NextSeo
        title={pageTitle}
        description={description}
        canonical={`${config.SITE_URL}${asPath}`}
        openGraph={{
          title: pageTitle,
          description: description,
          url: `${config.SITE_URL}${asPath}`,
          type: "website",
        }}
        additionalMetaTags={[{ name: "keywords", content: keywords }]}
      />
      <div
        style={{
          minHeight: "600px",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
      >
        <ApiReferenceReact
          configuration={{
            url: "/relic-api-spec.yaml",
            layout: "modern",
            showSidebar: true,
            hideTestRequestButton: true,
            hideModels: false,
            defaultOpenAllTags: true,
            slug: "relic-community-api",
            isEditable: true,
            darkMode: true,
            customCss: customCss,
          }}
        />
      </div>
    </div>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default RelicApiDocs;
