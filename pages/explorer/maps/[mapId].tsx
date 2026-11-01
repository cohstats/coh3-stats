import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import Error from "next/error";
import { useEffect } from "react";
import { Container } from "@mantine/core";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import { getMpMaps } from "../../../src/explorer/maps/mp-maps";
import {
  getMpMapImageUrl,
  getMpMapMode,
  MP_MAP_TEAM_LAYOUTS,
} from "../../../src/explorer/maps/mp-maps-helpers";
import MapDetailPage from "../../../screens/explorer/maps/map-detail-page";
import type { MpMap } from "../../../src/explorer/maps/mp-maps-types";
import {
  getExplorerRoute,
  getExplorerMapRoute,
  getExplorerMapsRoute,
  mapStatsModeType,
} from "../../../src/routes";
import { isOfficialMap } from "../../../src/coh3/coh3-data";
import {
  getLatestPatchMapTeamComposition,
  MapTeamComposition,
} from "../../../src/stats/latest-patch-map-stats";
import { generateLanguageAlternates, getLocalizedUrl } from "../../../src/seo-utils";
import { AnalyticsExplorerMapDetailsView } from "../../../src/firebase/analytics";
import PageJsonLd from "../../../components/page-json-ld";

interface MapDetailProps {
  map: MpMap | null;
  teamComposition: MapTeamComposition | null;
  latestPatch: string;
}

/** Detail page of a single map - see `MapDetailPage` for the layout. */
const MapDetail: NextPage<MapDetailProps> = ({ map, teamComposition, latestPatch }) => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation(["explorer-maps"]);

  useEffect(() => {
    if (map) AnalyticsExplorerMapDetailsView(map.id);
  }, [map?.id]);

  if (!map) {
    return <Error statusCode={404} title="Map Not Found" />;
  }

  const path = getExplorerMapRoute(map.id);
  const title = `${map.name} - COH3 Map`;
  // The descriptions carry escaped newlines from the data file, those have no place in a meta tag.
  const description = (map.description ?? t("meta.description")).replace(/\\n/g, " ").trim();
  const metaDescription = description.slice(0, 160);
  const image = getMpMapImageUrl(map.id);

  return (
    <>
      <Head>
        {generateNextSeo({
          title,
          description: metaDescription,
          canonical: getLocalizedUrl(path, locale),
          openGraph: {
            title,
            description: metaDescription,
            url: getLocalizedUrl(path, locale),
            images: [{ url: image, alt: map.name }],
          },
          languageAlternates: generateLanguageAlternates(path),
        })}
      </Head>
      <PageJsonLd
        path={path}
        name={title}
        description={metaDescription}
        breadcrumbName={map.name}
        trail={[
          { name: t("common:mainMenu.explorer"), path: getExplorerRoute() },
          { name: t("common:mainMenu.explMenu.maps"), path: getExplorerMapsRoute() },
        ]}
        image={image}
      />

      <Container size="lg" p={0}>
        <MapDetailPage
          map={map}
          teamComposition={teamComposition}
          latestPatch={latestPatch}
          t={t}
        />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps<MapDetailProps> = async (context) => {
  const locale = context.locale || "en";
  const mapId = context.params?.mapId as string;

  // The detail page draws the point layout, so unlike the list page it needs the points.
  const mpMapsData = await getMpMaps({ locale, includePoints: true });
  const map = mpMapsData?.maps[mapId] ?? null;

  // Only a real unknown map id is a 404 - when the whole data file is unavailable we still render
  // the page (with the not found state) instead of caching a 404 for every map.
  if (mpMapsData && !map) {
    return { notFound: true, revalidate: false };
  }

  // We track the map stats only for the official automatch maps, and only for the team modes.
  const mode = map ? getMpMapMode(map) : null;
  const teamComposition =
    map && isOfficialMap(map.id) && MP_MAP_TEAM_LAYOUTS.includes(mode as mapStatsModeType)
      ? await getLatestPatchMapTeamComposition(map.id, mode as mapStatsModeType)
      : null;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer-maps"])),
      map,
      teamComposition,
      latestPatch: config.latestPatch,
    },
    // The map data only changes with a deploy, but the team composition stats are updated daily.
    revalidate: 86400,
  };
};

export const getStaticPaths: GetStaticPaths<{ mapId: string }> = async () => {
  // If FULL_BUILD is not enabled, return empty paths to minimize build time
  if (!config.FULL_BUILD) {
    return {
      paths: [],
      fallback: "blocking", // All pages will be generated on-demand
    };
  }

  const mpMapsData = await getMpMaps({ includePoints: false });

  return {
    paths: Object.keys(mpMapsData?.maps ?? {}).map((mapId) => ({ params: { mapId } })),
    fallback: "blocking",
  };
};

export default MapDetail;
