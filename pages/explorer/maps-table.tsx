import { GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import MapsTablePage from "../../screens/explorer/maps/maps-table-page";
import { getMpMaps } from "../../src/explorer/maps/mp-maps";
import { MpMapTableItem, toMpMapTableItem } from "../../src/explorer/maps/mp-maps-helpers";
import { createPageSEO } from "../../src/seo-utils";
import { getExplorerMapsTableRoute } from "../../src/routes";
import { AnalyticsExplorerMapsTableView } from "../../src/firebase/analytics";

interface MapsTableProps {
  maps: MpMapTableItem[];
}

/** Table view of all the maps - see `MapsTablePage`, `/explorer/maps` is the card view of the same. */
const MapsTable: NextPage<MapsTableProps> = ({ maps }) => {
  const { t } = useTranslation(["explorer-maps-table"]);

  useEffect(() => {
    AnalyticsExplorerMapsTableView();
  }, []);

  const seoProps = createPageSEO(t, "explorer-maps-table", getExplorerMapsTableRoute());

  return (
    <>
      <NextSeo {...seoProps} />
      <MapsTablePage maps={maps} />
    </>
  );
};

export const getStaticProps: GetStaticProps<MapsTableProps> = async ({ locale = "en" }) => {
  // The table shows the aggregated resource data only, the point layout is the detail page's job -
  // and it is by far the heaviest part of the data file.
  const mpMapsData = await getMpMaps({ locale, includePoints: false });

  // No sorting here - the table sorts itself (by name by default).
  const maps = Object.values(mpMapsData?.maps ?? {}).map(toMpMapTableItem);

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "explorer-maps",
        "explorer-maps-table",
      ])),
      maps,
    },
    revalidate: false,
  };
};

export default MapsTable;
