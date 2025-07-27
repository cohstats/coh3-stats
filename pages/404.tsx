import { Stack } from "@mantine/core";
import { NextSeo } from "next-seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function Custom404() {
  const { t } = useTranslation("common");

  return (
    <>
      <NextSeo
        title="Page Not Found"
        description="The page you are looking for could not be found."
        noindex={true}
        nofollow={true}
      />
      <Stack align="center" justify="center" style={{ minHeight: "20vh" }}>
        <h1>{t("errors.404.title")}</h1>
        <h3>{t("errors.404.message")}</h3>
      </Stack>
    </>
  );
}

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};
