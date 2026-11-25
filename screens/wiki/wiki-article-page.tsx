import React from "react";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { generateNextSeo } from "next-seo/pages";
import { useTranslation } from "next-i18next/pages";
import { Anchor, Badge, Card, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconClock,
  IconDeviceGamepad2,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import config from "../../config";
import { WikiArticleLink, WikiNavCategory, WikiSeriesInfo } from "../../src/wiki/get-wiki";
import { WikiArticle, WikiHeading } from "../../src/wiki/wiki-types";
import { getWikiArticleJsonLd } from "../../src/wiki/wiki-structured-data";
import { serializeJsonLd } from "../../src/news/news-structured-data";
import { getWikiRoute } from "../../src/routes";
import { createPageSEO } from "../../src/seo-utils";
import { WikiLayout } from "./components/wiki-layout";
import { WikiArticleBody } from "./components/wiki-article-body";
import { WikiTocMobile } from "./components/wiki-toc";
import classes from "./Wiki.module.css";

export type WikiArticlePageProps = {
  navigation: WikiNavCategory[];
  article: WikiArticle;
  headings: WikiHeading[];
  readingMinutes: number;
  /** The game patch the article applies to. */
  patch: string | null;
  image: string | null;
  categoryTitle: string;
  groupTitle: string | null;
  series: WikiSeriesInfo | null;
  previous: WikiArticleLink | null;
  next: WikiArticleLink | null;
};

const NeighbourCard = ({
  article,
  direction,
  label,
}: {
  article: WikiArticleLink;
  direction: "previous" | "next";
  label: string;
}) => {
  const isNext = direction === "next";
  return (
    <Card
      component={Link}
      href={getWikiRoute(article.category, article.slug)}
      withBorder
      radius="md"
      padding="sm"
      ta={isNext ? "right" : "left"}
      className={classes.card}
      // Next stays in the right column even without a previous article.
      style={isNext ? { gridColumn: "-2" } : undefined}
      data-testid={`wiki-${direction}`}
    >
      <Group gap={4} justify={isNext ? "flex-end" : "flex-start"}>
        {!isNext && <IconArrowLeft size={14} />}
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {label}
        </Text>
        {isNext && <IconArrowRight size={14} />}
      </Group>
      <Text fw={600} lineClamp={2} className={classes.whiteColor}>
        {article.title}
      </Text>
    </Card>
  );
};

const WikiArticlePage: NextPage<WikiArticlePageProps> = ({
  navigation,
  article,
  headings,
  readingMinutes,
  patch,
  image,
  categoryTitle,
  groupTitle,
  series,
  previous,
  next,
}) => {
  const { t } = useTranslation("wiki");
  const { locale = "en" } = useRouter();
  const path = getWikiRoute(article.category, article.slug);
  const seoProps = createPageSEO(t, "wiki", path, locale);
  const url = seoProps.canonical ?? `${config.SITE_URL}${path}`;
  const absoluteImage = image?.startsWith("/") ? `${config.SITE_URL}${image}` : image;
  const title = `${article.title} - ${t("title")}`;
  const jsonLd = getWikiArticleJsonLd({
    article,
    url,
    image: absoluteImage,
    categoryTitle,
    wikiTitle: t("title"),
  });
  const formatDate = (date: string) => dayjs(date).locale(locale).format("D MMM YYYY");

  return (
    <>
      <Head>
        {generateNextSeo({
          ...seoProps,
          title,
          description: article.summary,
          robotsProps: { maxImagePreview: "large" },
          openGraph: {
            ...seoProps.openGraph,
            title: article.title,
            description: article.summary,
            type: "article",
            article: {
              publishedTime: new Date(`${article.date}T00:00:00Z`).toISOString(),
              modifiedTime: new Date(
                `${article.updated ?? article.date}T00:00:00Z`,
              ).toISOString(),
              section: categoryTitle,
              tags: ["Company of Heroes 3", "COH3", ...article.tags],
            },
            images: absoluteImage
              ? [{ url: absoluteImage, alt: article.title }]
              : seoProps.openGraph?.images,
          },
        })}
        <script
          key="wiki-article-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </Head>
      <WikiLayout
        breadcrumbs={[
          { label: t("siteHome"), href: "/" },
          { label: t("home"), href: getWikiRoute() },
          { label: categoryTitle, href: getWikiRoute(article.category) },
          { label: article.title },
        ]}
        navigation={navigation}
        currentCategory={article.category}
        currentArticle={article.slug}
        headings={headings}
      >
        <article>
          <Stack gap={6} mb="lg">
            {(groupTitle || series) && (
              <Group gap="xs">
                {groupTitle && (
                  <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                    {groupTitle}
                  </Text>
                )}
                {series && (
                  <Badge variant="light" data-testid="wiki-series-part">
                    {t("partOf", { part: series.part, total: series.parts.length })}
                  </Badge>
                )}
              </Group>
            )}
            <Title order={1} className={`${classes.whiteColor} ${classes.pageTitle}`}>
              {article.title}
            </Title>
            <Text c="dimmed" size="lg">
              {article.summary}
            </Text>
            <Group gap="md" c="dimmed" mt={4}>
              <Group gap={4}>
                <IconUser size={15} />
                <Text size="sm">
                  {t("by")} {article.author}
                </Text>
              </Group>
              <Group gap={4} data-testid="wiki-article-date">
                <IconCalendar size={15} />
                <Text size="sm">
                  {t("written")} {formatDate(article.date)}
                </Text>
              </Group>
              {article.updated && (
                <Group gap={4} data-testid="wiki-article-updated">
                  <IconRefresh size={15} />
                  <Text size="sm">
                    {t("updated")} {formatDate(article.updated)}
                  </Text>
                </Group>
              )}
              {patch && (
                <Group gap={4} data-testid="wiki-article-patch">
                  <IconDeviceGamepad2 size={15} />
                  <Text size="sm">{t("patch", { patch })}</Text>
                </Group>
              )}
              <Group gap={4}>
                <IconClock size={15} />
                <Text size="sm">{t("minutesRead", { count: readingMinutes })}</Text>
              </Group>
            </Group>
          </Stack>

          {series && (
            <Paper withBorder radius="md" p="sm" mb="lg" data-testid="wiki-series">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>
                {t("series")}: {series.title}
              </Text>
              <Stack gap={2}>
                {series.parts.map((part, index) =>
                  part.slug === article.slug ? (
                    <Text key={part.slug} size="sm" fw={700}>
                      {index + 1}. {part.title}
                    </Text>
                  ) : (
                    <Anchor
                      key={part.slug}
                      component={Link}
                      href={getWikiRoute(part.category, part.slug)}
                      size="sm"
                    >
                      {index + 1}. {part.title}
                    </Anchor>
                  ),
                )}
              </Stack>
            </Paper>
          )}

          <WikiTocMobile headings={headings} title={t("onThisPage")} />

          <WikiArticleBody contents={article.contents} />
        </article>

        {(previous || next) && (
          <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl" data-testid="wiki-neighbours">
            {previous && (
              <NeighbourCard article={previous} direction="previous" label={t("previous")} />
            )}
            {next && <NeighbourCard article={next} direction="next" label={t("next")} />}
          </SimpleGrid>
        )}

        <Group justify="center" mt="lg" mb="md">
          <Anchor component={Link} href={getWikiRoute(article.category)} size="sm">
            {t("allArticlesIn", { category: categoryTitle })}
          </Anchor>
        </Group>
      </WikiLayout>
    </>
  );
};

export default WikiArticlePage;
