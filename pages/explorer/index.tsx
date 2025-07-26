import { NextSeo } from "next-seo";
import { NextPage } from "next";
import { Anchor, Card, Container, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { raceType } from "../../src/coh3/coh3-types";
import { localizedNames } from "../../src/coh3/coh3-data";
import FactionIcon from "../../components/faction-icon";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import { getExplorerFactionRoute } from "../../src/routes";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { createPageSEO } from "../../src/seo-utils";

const Races: raceType[] = ["german", "american", "dak", "british"];

const Explorer: NextPage = () => {
  const { t } = useTranslation(["explorer"]);

  // Create SEO props for explorer page
  const seoProps = createPageSEO(t, "explorer", "/explorer");

  return (
    <>
      <NextSeo {...seoProps} />
      <Container size="md">
        <Stack mb={24}>
          <Title order={1}>{t("explorer.title")}</Title>
          <Text size="lg" mt={4}>
            {t("explorer.subtitle")}
          </Text>
        </Stack>

        <Stack>
          <Title order={2}>Factions</Title>
          <SimpleGrid cols={2}>
            {Races.map((faction: raceType) => {
              return (
                <Anchor
                  key={`explorer_${faction}`}
                  c="undefined"
                  underline={"never"}
                  component={LinkWithOutPrefetch}
                  href={getExplorerFactionRoute(faction)}
                >
                  <Card p="sm" radius="md" withBorder>
                    <Flex direction="row" justify="space-between" align="center">
                      <Flex direction="row" align="center" gap="md">
                        <FactionIcon name={faction} width={64} />
                        <Title order={3} size="h4" fw="bold">
                          {localizedNames[faction]}
                        </Title>
                      </Flex>
                      <IconChevronRight size={16} />
                    </Flex>
                  </Card>
                </Anchor>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Container>
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
    },
  };
};

export default Explorer;
