import { Stack } from "@mantine/core";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function Custom404() {
  const { t } = useTranslation("common");

  return (
    <Stack align="center" justify="center" style={{ minHeight: "20vh" }}>
      <h1>{t("errors.404.title")}</h1>
      <h3>{t("errors.404.message")}</h3>
    </Stack>
  );
}

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};
