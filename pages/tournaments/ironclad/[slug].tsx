import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import IroncladTournamentScreen, {
  IroncladTournamentPageProps,
} from "../../../screens/tournaments/ironclad";
import {
  getIroncladTournamentPageResult,
  IRONCLAD_TOURNAMENT_REVALIDATE,
} from "../../../src/tournaments/ironclad-tournament-data";

export default IroncladTournamentScreen;

export const getStaticProps: GetStaticProps<
  IroncladTournamentPageProps,
  { slug: string }
> = async ({ locale = "en", params }) => {
  const slug = params?.slug ?? "";

  // Only lowercase slugs, so there is one URL per tournament
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { notFound: true, revalidate: IRONCLAD_TOURNAMENT_REVALIDATE };
  }

  console.log(`ISR - /tournaments/ironclad/${slug}`);

  const result = await getIroncladTournamentPageResult(slug);

  // Revalidated, so a new tournament appears once the API has it
  if (result.status === "notFound") {
    return { notFound: true, revalidate: result.revalidate };
  }

  return {
    props: {
      slug,
      data: result.status === "ok" ? result.data : null,
      ...(await serverSideTranslations(locale, ["common", "tournaments"])),
    },
    revalidate: result.revalidate,
  };
};

// Nothing is fetched at build time, so the build works without the API token
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
