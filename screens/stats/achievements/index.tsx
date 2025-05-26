import { GlobalAchievementsData } from "../../../src/coh3/coh3-types";
import { generateKeywordsString } from "../../../src/head-utils";
import Head from "next/head";
import { Container, Flex, Text, Title } from "@mantine/core";
import React from "react";
import ErrorCard from "../../../components/error-card";
import Achievement from "./achievement";
import dayjs from "dayjs";
import { useRouter } from "next/router";

const pageTitle = `Game Stats & Charts - Company of Heroes 3`;
const description = `Global Achievements for Company of Heroes 3.`;
const metaKeywords = generateKeywordsString([
  `Achievements`,
  `Steam Achievements`,
  `coh3 achievements`,
]);

const GlobalAchievements = ({
  globalAchievements,
  error,
}: {
  globalAchievements: GlobalAchievementsData | null;
  error: string | null;
}) => {
  const { locale } = useRouter();

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>

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
