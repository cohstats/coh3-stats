import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import { Container, Stack, Text, Title } from "@mantine/core";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import config from "../../../../../config";
import { getFsPerks } from "../../../../../src/explorer/fs-perks/fs-perks";
import { getFsPerksRace } from "../../../../../src/explorer/fs-perks/fs-perks-helpers";
import type { FsPerksRace } from "../../../../../src/explorer/fs-perks/fs-perks-types";
import { localizedNames } from "../../../../../src/coh3/coh3-data";
import { raceTypeArray, type raceType } from "../../../../../src/coh3/coh3-types";
import { getExplorerFsPerksRoute } from "../../../../../src/routes";
import { createPageSEO } from "../../../../../src/seo-utils";
import FsPerksPage from "../../../../../screens/explorer/fs-perks/fs-perks-page";

interface FsPerksProps {
  /** `null` only when the data file could not be downloaded at build time. */
  race: FsPerksRace | null;
  /** Factions the data file has a perk tree for - the targets of the faction switch. */
  availableRaces: raceType[];
  /** The race of the url, needed for the SEO tags when the data is unavailable. */
  raceId: raceType;
}

/** Final Stand perk tree of a single faction - see `FsPerksPage` for the layout. */
const FsPerks: NextPage<FsPerksProps> = ({ race, availableRaces, raceId }) => {
  const { t } = useTranslation(["explorer-fs-perks"]);

  const path = getExplorerFsPerksRoute(raceId);
  const seoProps = createPageSEO(t, "explorer-fs-perks", path, {
    faction: race?.name ?? localizedNames[raceId],
  });

  return (
    <>
      <NextSeo {...seoProps} />
      {race ? (
        <FsPerksPage race={race} availableRaces={availableRaces} t={t} />
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

export const getStaticProps: GetStaticProps<FsPerksProps> = async (context) => {
  const locale = context.locale || "en";
  const raceId = context.params?.raceId as string;

  if (!raceTypeArray.includes(raceId as raceType)) {
    return { notFound: true, revalidate: false };
  }

  const fsPerksData = await getFsPerks({ locale });
  const race = getFsPerksRace(fsPerksData, raceId as raceType);

  // A faction the data file doesn't have a tree for is a real 404. When the whole file is
  // unavailable we still render the page (with the not available state) instead of caching a 404.
  if (fsPerksData && !race) {
    return { notFound: true, revalidate: false };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer-fs-perks"])),
      race,
      availableRaces: fsPerksData?.raceList.map(({ race: parsedRace }) => parsedRace) ?? [],
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

export default FsPerks;
