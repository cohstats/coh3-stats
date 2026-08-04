import { GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import MapsExplorerPage from "../../../screens/explorer/maps/maps-explorer-page";
import { getMpMaps } from "../../../src/explorer/mp-maps";
import {
  MpMapListItem,
  sortMpMapsByName,
  toMpMapListItem,
} from "../../../src/explorer/mp-maps-helpers";
import { createPageSEO } from "../../../src/seo-utils";
import { getExplorerMapsRoute } from "../../../src/routes";
import { AnalyticsExplorerMapsListView } from "../../../src/firebase/analytics";

interface MapsPageProps {
  maps: MpMapListItem[];
}

const Maps: NextPage<MapsPageProps> = ({ maps }) => {
  const { t } = useTranslation(["explorer-maps"]);

  useEffect(() => {
    AnalyticsExplorerMapsListView();
  }, []);

  const seoProps = createPageSEO(t, "explorer-maps", getExplorerMapsRoute());

  return (
    <>
      <NextSeo {...seoProps} />
      <MapsExplorerPage maps={maps} />
    </>
  );
};

export const getStaticProps: GetStaticProps<MapsPageProps> = async ({ locale = "en" }) => {
  // The points layout is by far the heaviest part of the data and the list page doesn't need it.
  const mpMapsData = await getMpMaps({ locale, includePoints: false });

  const maps = sortMpMapsByName(Object.values(mpMapsData?.maps ?? {}).map(toMpMapListItem));

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer-maps"])),
      maps,
    },
    revalidate: false,
  };
};

export default Maps;
