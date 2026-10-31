import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { NextPage } from "next";
import { Container, Stack, Text, Title } from "@mantine/core";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import { createPageSEO } from "../../../src/seo-utils";
import { getExplorerRoute, getExplorerFsRoute } from "../../../src/routes";
import FinalStandSection from "../../../screens/explorer/final-stand-section";
import PageJsonLd from "../../../components/page-json-ld";

const FinalStandExplorer: NextPage = () => {
  const { t } = useTranslation(["explorer-fs", "explorer"]);

  const seoProps = createPageSEO(t, "explorer-fs", getExplorerFsRoute());

  return (
    <>
      <Head>{generateNextSeo(seoProps)}</Head>
      <PageJsonLd
        path={getExplorerFsRoute()}
        name={seoProps.title ?? ""}
        description={seoProps.description}
        breadcrumbName={t("common:mainMenu.explMenu.finalStand")}
        trail={[{ name: t("common:mainMenu.explorer"), path: getExplorerRoute() }]}
      />
      <Container size="md">
        <Stack mb={24}>
          <Title order={1}>{t("explorer-fs:page.title")}</Title>
          <Text size="lg" mt={4}>
            {t("explorer:explorer.finalStand.description")}
          </Text>
        </Stack>

        <FinalStandSection showTitle={false} />
      </Container>
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer", "explorer-fs"])),
    },
  };
};

export default FinalStandExplorer;
