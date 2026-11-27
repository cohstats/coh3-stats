import React from "react";
import Head from "next/head";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { generateNextSeo } from "next-seo/pages";
import { useTranslation } from "next-i18next/pages";
import { Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBulb } from "@tabler/icons-react";
import { WikiNavCategory } from "../../src/wiki/get-wiki";
import { getWikiRoute } from "../../src/routes";
import { createPageSEO } from "../../src/seo-utils";
import { WikiLayout } from "./components/wiki-layout";
import { WikiCategoryIcon } from "./components/wiki-category-icon";
import { WikiArticleCard } from "./components/wiki-article-card";
import classes from "./Wiki.module.css";

export type WikiCategoryPageProps = {
  navigation: WikiNavCategory[];
  categorySlug: string;
  /** Only in the "Game Tips" category: the number of tips of each page, by its slug. */
  tipCounts?: Record<string, number> | null;
};

const WikiCategoryPage: NextPage<WikiCategoryPageProps> = ({
  navigation,
  categorySlug,
  tipCounts = null,
}) => {
  const { t } = useTranslation("wiki");
  const { locale = "en" } = useRouter();
  const category = navigation.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const seoProps = createPageSEO(t, "wiki", getWikiRoute(category.slug), locale);
  const title = `${category.title} - ${t("title")}`;

  return (
    <>
      <Head>
        {generateNextSeo({
          ...seoProps,
          title,
          description: category.description,
          openGraph: { ...seoProps.openGraph, title, description: category.description },
        })}
      </Head>
      <WikiLayout
        breadcrumbs={[
          { label: t("siteHome"), href: "/" },
          { label: t("home"), href: getWikiRoute() },
          { label: category.title },
        ]}
        navigation={navigation}
        currentCategory={category.slug}
      >
        <Stack gap="xl">
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon size={48} variant="light" color={category.color} radius="md">
              <WikiCategoryIcon icon={category.icon} size={28} />
            </ThemeIcon>
            <div>
              <Title order={1} className={`${classes.whiteColor} ${classes.pageTitle}`}>
                {category.title}
              </Title>
              <Text c="dimmed" mt={4}>
                {category.description}
              </Text>
            </div>
          </Group>

          {category.groups.map((group) => (
            <div key={group.id ?? "ungrouped"} data-testid={`wiki-group-${group.id ?? "other"}`}>
              {group.title && (
                <Title order={2} size="h3" mb="sm">
                  {group.title}
                </Title>
              )}
              <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="md">
                {group.articles.map((article) => (
                  <WikiArticleCard
                    key={article.slug}
                    article={article}
                    minutesLabel={
                      tipCounts
                        ? t("tipCount", { count: tipCounts[article.slug] ?? 0 })
                        : t("minutesRead", { count: article.readingMinutes })
                    }
                    metaIcon={tipCounts ? <IconBulb size={14} /> : undefined}
                    partLabel={
                      article.seriesPart ? t("part", { part: article.seriesPart }) : undefined
                    }
                  />
                ))}
              </SimpleGrid>
            </div>
          ))}
        </Stack>
      </WikiLayout>
    </>
  );
};

export default WikiCategoryPage;
