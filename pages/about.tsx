import About from "../screens/about";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default About;
