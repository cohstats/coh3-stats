import { GlobalAchievementsData } from "../../../src/coh3/coh3-types";
import { generateKeywordsString, getLocalizedUrl } from "../../../src/seo-utils";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { getGlobalAchievementsStatsRoute } from "../../../src/routes";
import PageJsonLd from "../../../components/page-json-ld";
import { Container, Flex, Text, Title } from "@mantine/core";
import React from "react";
import ErrorCard from "../../../components/error-card";
import Achievement from "./achievement";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";

const GlobalAchievements = ({
  globalAchievements,
  error,
}: {
  globalAchievements: GlobalAchievementsData | null;
  error: string | null;
}) => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation(["common", "stats"]);

  const pageTitle = t("stats:achievements.meta.title");
  const description = t("stats:achievements.meta.description");

  // Get keywords from translation
  let keywords: string[] = [];
  try {
    const translatedKeywords = t("stats:achievements.meta.keywords", { returnObjects: true });
    if (Array.isArray(translatedKeywords)) {
      keywords = translatedKeywords as string[];
    }
  } catch (error) {
    keywords = ["achievements", "steam achievements", "coh3 achievements"];
  }

  return (
    <>
      <Head>
        {generateNextSeo({
          title: pageTitle,
          description,
          canonical: getLocalizedUrl("/stats/achievements", locale),
          openGraph: {
            title: pageTitle,
            description,
            url: getLocalizedUrl("/stats/achievements", locale),
          },
          additionalMetaTags: [
            {
              name: "keywords",
              content: generateKeywordsString(keywords),
            },
          ],
        })}
      </Head>
      <PageJsonLd
        path={getGlobalAchievementsStatsRoute()}
        name={pageTitle}
        description={description}
        breadcrumbName={t("common:mainMenu.statsMenu.achievements")}
      />

      <Container size={"md"}>
        <Flex justify="space-between" align={"center"}>
          <Title order={2}>Global Steam Achievements</Title>
          <Text size={"sm"}>(% based on all players)</Text>
        </Flex>
        {error ? (
          <ErrorCard
            title={"Error getting the global achievements"}
            body={JSON.stringify(error)}
          />
        ) : (
          <>
            {globalAchievements && (
              <>
                {Object.keys(globalAchievements.globalAchievements).map((key) => (
                  <Achievement
                    key={key}
                    achievement={globalAchievements.globalAchievements[key]}
                  />
                ))}

                <Text style={{ textAlign: "center" }} fs="italic" c="dimmed" fz="sm" pt={25}>
                  Data updated on{" "}
                  {dayjs
                    .unix(globalAchievements.unixTimeStamp)
                    .locale(locale || "en")
                    .format("YYYY-MM-DD HH:mm")}{" "}
                  UTC
                </Text>
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default GlobalAchievements;
