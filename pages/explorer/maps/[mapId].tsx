import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import Error from "next/error";
import { useEffect } from "react";
import { Container } from "@mantine/core";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import { getMpMaps } from "../../../src/explorer/mp-maps";
import { getMpMapImageUrl } from "../../../src/explorer/mp-maps-helpers";
import MapDetailPage from "../../../screens/explorer/maps/map-detail-page";
import type { MpMap } from "../../../src/explorer/mp-maps-types";
import { getExplorerMapRoute } from "../../../src/routes";
import { generateLanguageAlternates } from "../../../src/seo-utils";
import { AnalyticsExplorerMapDetailsView } from "../../../src/firebase/analytics";

interface MapDetailProps {
  map: MpMap | null;
}

/** Detail page of a single map - see `MapDetailPage` for the layout. */
const MapDetail: NextPage<MapDetailProps> = ({ map }) => {
  const { t } = useTranslation(["explorer-maps"]);

  useEffect(() => {
    if (map) AnalyticsExplorerMapDetailsView(map.id);
  }, [map?.id]);

  if (!map) {
    return <Error statusCode={404} title="Map Not Found" />;
  }

  const path = getExplorerMapRoute(map.id);
  const title = `${map.name} - COH3 Map | COH3 Stats`;
  // The descriptions carry escaped newlines from the data file, those have no place in a meta tag.
  const description = (map.description ?? t("meta.description")).replace(/\\n/g, " ").trim();

  return (
    <>
      <NextSeo
        title={title}
        description={description.slice(0, 160)}
        canonical={`${config.SITE_URL}${path}`}
        openGraph={{
          title,
          description: description.slice(0, 160),
          url: `${config.SITE_URL}${path}`,
          images: [{ url: getMpMapImageUrl(map.id), alt: map.name }],
        }}
        languageAlternates={generateLanguageAlternates(path)}
      />
      <Container size="lg" p={0}>
        <MapDetailPage map={map} t={t} />
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

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer-maps"])),
      map,
    },
    revalidate: false,
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
