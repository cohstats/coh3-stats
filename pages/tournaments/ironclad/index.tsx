import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import IroncladOverviewScreen, {
  IroncladOverviewPageProps,
} from "../../../screens/tournaments/ironclad/overview";
import { getIroncladOverviewResult } from "../../../src/tournaments/ironclad-tournament-data";

export default IroncladOverviewScreen;

// All the IronClad tournaments, the hub links here
export const getStaticProps: GetStaticProps<IroncladOverviewPageProps> = async ({
  locale = "en",
}) => {
  console.log(`ISR - /tournaments/ironclad`);

  const { data, revalidate } = await getIroncladOverviewResult();

  return {
    props: {
      data,
      ...(await serverSideTranslations(locale, ["common", "tournaments"])),
    },
    revalidate,
  };
};
