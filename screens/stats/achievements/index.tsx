import { GlobalAchievementsData } from "../../../src/coh3/coh3-types";
import { generateKeywordsString } from "../../../src/seo-utils";
import { NextSeo } from "next-seo";
import { Container, Flex, Text, Title } from "@mantine/core";
import React from "react";
import ErrorCard from "../../../components/error-card";
import Achievement from "./achievement";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const GlobalAchievements = ({
  globalAchievements,
  error,
}: {
  globalAchievements: GlobalAchievementsData | null;
  error: string | null;
}) => {
  const { locale } = useRouter();
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
      <NextSeo
        title={pageTitle}
        description={description}
        canonical="https://coh3stats.com/stats/achievements"
        openGraph={{
          title: pageTitle,
          description: description,
          url: "https://coh3stats.com/stats/achievements",
          type: "website",
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content: generateKeywordsString(keywords),
          },
        ]}
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
