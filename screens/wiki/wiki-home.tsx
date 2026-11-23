import React from "react";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { generateNextSeo } from "next-seo/pages";
import { useTranslation } from "next-i18next/pages";
import { Anchor, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { WikiArticleLink, WikiNavCategory } from "../../src/wiki/get-wiki";
import { getWikiRoute } from "../../src/routes";
import { createPageSEO } from "../../src/seo-utils";
import { WikiLayout } from "./components/wiki-layout";
import { WikiCategoryIcon } from "./components/wiki-category-icon";
import { WikiArticleCard } from "./components/wiki-article-card";
import classes from "./Wiki.module.css";

export type WikiHomeProps = {
  navigation: WikiNavCategory[];
  /** The first article of every series and the standalone ones. */
  featured: WikiArticleLink[];
};

const WikiHome: NextPage<WikiHomeProps> = ({ navigation, featured }) => {
  const { t } = useTranslation("wiki");
  const { locale = "en" } = useRouter();
  const seoProps = createPageSEO(t, "wiki", getWikiRoute(), locale);

  return (
    <>
      <Head>{generateNextSeo(seoProps)}</Head>
      <WikiLayout
        breadcrumbs={[{ label: t("siteHome"), href: "/" }, { label: t("home") }]}
        navigation={navigation}
      >
        <Stack gap="xl">
          <div>
            <Title order={1} className={`${classes.whiteColor} ${classes.pageTitle}`}>
              {t("title")}
            </Title>
            <Text c="dimmed" mt="xs" maw={760}>
              {t("intro")}
            </Text>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">
              {t("categories")}
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {navigation.map((category) => (
                <Card
                  key={category.slug}
                  withBorder
                  radius="md"
                  padding="lg"
                  data-testid={`wiki-category-card-${category.slug}`}
                >
                  <Group gap="sm" wrap="nowrap" mb="xs">
                    <ThemeIcon size="lg" variant="light" color={category.color}>
                      <WikiCategoryIcon icon={category.icon} size={20} />
                    </ThemeIcon>
                    <div>
                      <Anchor
                        component={Link}
                        href={getWikiRoute(category.slug)}
                        fw={700}
                        fz="lg"
                        className={classes.whiteColor}
                      >
                        {category.title}
                      </Anchor>
                      <Text size="xs" c="dimmed">
                        {t("articleCount", { count: category.articleCount })}
                      </Text>
                    </div>
                  </Group>
                  <Text size="sm" c="dimmed" mb="sm">
                    {category.description}
                  </Text>
                  <Stack gap={6}>
                    {category.groups.map((group) => (
                      <div key={group.id ?? "ungrouped"}>
                        {group.title && (
                          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={2}>
                            {group.title}
                          </Text>
                        )}
                        {group.articles.map((article) => (
                          <Anchor
                            key={article.slug}
                            component={Link}
                            href={getWikiRoute(article.category, article.slug)}
                            size="sm"
                            display="block"
                          >
                            {article.title}
                          </Anchor>
                        ))}
                      </div>
                    ))}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">
              {t("latest")}
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {featured.map((article) => (
                <WikiArticleCard
                  key={article.slug}
                  article={article}
                  minutesLabel={t("minutesRead", { count: article.readingMinutes })}
                />
              ))}
            </SimpleGrid>
          </div>

          <Text size="sm" c="dimmed">
            {t("feedback")}
          </Text>
        </Stack>
      </WikiLayout>
    </>
  );
};

export default WikiHome;
