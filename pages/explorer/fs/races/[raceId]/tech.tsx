import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import { Container, Stack, Text, Title } from "@mantine/core";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import config from "../../../../../config";
import { getFsTechnologies } from "../../../../../src/explorer/fs-technologies/fs-technologies";
import { getFsTechnologiesRace } from "../../../../../src/explorer/fs-technologies/fs-technologies-helpers";
import type {
  FsTechMeta,
  FsTechnologiesRace,
} from "../../../../../src/explorer/fs-technologies/fs-technologies-types";
import { localizedNames } from "../../../../../src/coh3/coh3-data";
import { raceTypeArray, type raceType } from "../../../../../src/coh3/coh3-types";
import { getExplorerFsTechRoute } from "../../../../../src/routes";
import { createPageSEO } from "../../../../../src/seo-utils";
import FsTechPage from "../../../../../screens/explorer/fs-tech/fs-tech-page";

interface FsTechProps {
  /** `null` only when the data file could not be downloaded at build time. */
  race: FsTechnologiesRace | null;
  /** The draft rules, `null` together with `race`. */
  meta: FsTechMeta | null;
  /** Factions the data file has a technology list for - the targets of the faction switch. */
  availableRaces: raceType[];
  /** The race of the url, needed for the SEO tags when the data is unavailable. */
  raceId: raceType;
}

/** Final Stand technology draft of a single faction - see `FsTechPage` for the layout. */
const FsTech: NextPage<FsTechProps> = ({ race, meta, availableRaces, raceId }) => {
  const { t } = useTranslation(["explorer-fs-tech"]);

  const path = getExplorerFsTechRoute(raceId);
  const seoProps = createPageSEO(t, "explorer-fs-tech", path, {
    faction: race?.name ?? localizedNames[raceId],
  });

  return (
    <>
      <NextSeo {...seoProps} />
      {race && meta ? (
        <FsTechPage race={race} meta={meta} availableRaces={availableRaces} t={t} />
      ) : (
        <Container size="lg" p={0}>
          <Stack gap="sm">
            <Title order={1} size="h2">
              {t("page.title", { faction: localizedNames[raceId] })}
            </Title>
            <Text c="dimmed">{t("page.notAvailable")}</Text>
          </Stack>
        </Container>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps<FsTechProps> = async (context) => {
  const locale = context.locale || "en";
  const raceId = context.params?.raceId as string;

  if (!raceTypeArray.includes(raceId as raceType)) {
    return { notFound: true, revalidate: false };
  }

  const fsTechnologiesData = await getFsTechnologies({ locale });
  const race = getFsTechnologiesRace(fsTechnologiesData, raceId as raceType);

  // A faction the data file doesn't have a list for is a real 404. When the whole file is
  // unavailable we still render the page (with the not available state) instead of caching a 404.
  if (fsTechnologiesData && !race) {
    return { notFound: true, revalidate: false };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer-fs-tech"])),
      race,
      meta: fsTechnologiesData?.meta ?? null,
      availableRaces:
        fsTechnologiesData?.raceList.map(({ race: parsedRace }) => parsedRace) ?? [],
      raceId: raceId as raceType,
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths<{ raceId: string }> = async () => {
  // If FULL_BUILD is not enabled, return empty paths to minimize build time
  if (!config.FULL_BUILD) {
    return {
      paths: [],
      fallback: "blocking", // All pages will be generated on-demand
    };
  }

  return {
    paths: raceTypeArray.map((raceId) => ({ params: { raceId } })),
    fallback: "blocking",
  };
};

export default FsTech;
