import { useRouter } from "next/router";
import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import MapsExplorerPage from "../../../screens/explorer/maps/maps-explorer-page";
import { getMpMaps } from "../../../src/explorer/maps/mp-maps";
import {
  filterMpMaps,
  groupMpMapsByMode,
  MpMapListItem,
  toMpMapListItem,
} from "../../../src/explorer/maps/mp-maps-helpers";
import { getLatestPatchMapWinRates } from "../../../src/stats/latest-patch-map-stats";
import { isOfficialMap } from "../../../src/coh3/coh3-data";
import type { mapStatsModeType } from "../../../src/routes";
import { createPageSEO } from "../../../src/seo-utils";
import { getExplorerRoute, getExplorerMapRoute, getExplorerMapsRoute } from "../../../src/routes";
import { AnalyticsExplorerMapsListView } from "../../../src/firebase/analytics";
import PageJsonLd from "../../../components/page-json-ld";

interface MapsPageProps {
  maps: MpMapListItem[];
}

const Maps: NextPage<MapsPageProps> = ({ maps }) => {
  const { t } = useTranslation(["explorer-maps"]);

  useEffect(() => {
    AnalyticsExplorerMapsListView();
  }, []);

  const { locale = "en" } = useRouter();

  const seoProps = createPageSEO(t, "explorer-maps", getExplorerMapsRoute(), locale);
  // The maps the page lists with the default filters, in the same order - see `MapsExplorerPage`.
  const listedMaps = groupMpMapsByMode(
    filterMpMaps(maps, { search: "", modes: [], lobbyOnly: true }),
  ).flatMap(([, modeMaps]) => modeMaps);

  return (
    <>
      <Head>{generateNextSeo(seoProps)}</Head>
      <PageJsonLd
        path={getExplorerMapsRoute()}
        name={seoProps.title ?? ""}
        description={seoProps.description}
        breadcrumbName={t("common:mainMenu.explMenu.maps")}
        items={listedMaps.map((map) => ({ name: map.name, path: getExplorerMapRoute(map.id) }))}
        trail={[{ name: t("common:mainMenu.explorer"), path: getExplorerRoute() }]}
      />
      <MapsExplorerPage maps={maps} />
    </>
  );
};

export const getStaticProps: GetStaticProps<MapsPageProps> = async ({ locale = "en" }) => {
  // The points layout is by far the heaviest part of the data and the list page doesn't need it.
  const mpMapsData = await getMpMaps({ locale, includePoints: false });

  // No sorting here - both display paths (grouped by mode / flat while searching) sort themselves.
  const winRates = await getLatestPatchMapWinRates();
  const maps = Object.values(mpMapsData?.maps ?? {}).map((map) => {
    const item = toMpMapListItem(map);
    // Same as on the detail page - we track the stats only for the official automatch maps.
    const latestPatchStats = isOfficialMap(item.id)
      ? winRates[item.mode as mapStatsModeType]?.[item.id]
      : undefined;
    // Props have to be serializable, so the key is left out instead of being undefined.
    return latestPatchStats ? { ...item, latestPatchStats } : item;
  });

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer-maps"])),
      maps,
    },
    // The map data only changes with a deploy, but the win rates are updated daily.
    revalidate: 86400,
  };
};

export default Maps;
