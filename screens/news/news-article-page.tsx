import React, { useEffect } from "react";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import {
  Anchor,
  Button,
  Card,
  Container,
  Flex,
  Group,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconShare3 } from "@tabler/icons-react";
import dayjs from "dayjs";
import config from "../../config";
import { NewsItem } from "../../src/apis/steam-api";
import { AnalyticsNewsArticleView } from "../../src/firebase/analytics";
import { getNewsRoute } from "../../src/routes";
import { createPageSEO } from "../../src/seo-utils";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import { NewsArticleBody, NewsArticleMeta } from "./news-article";
import classes from "./News.module.css";

export type NewsArticleLink = { gid: string; title: string };

export type NewsArticlePageProps = {
  item: NewsItem;
  description: string;
  newerItem: NewsArticleLink | null;
  olderItem: NewsArticleLink | null;
};

const NeighbourArticleCard = ({
  article,
  direction,
  t,
}: {
  article: NewsArticleLink;
  direction: "newer" | "older";
  t: (key: string) => string;
}) => {
  const isOlder = direction === "older";
  const Arrow = isOlder ? IconArrowRight : IconArrowLeft;

  return (
    <Card
      component={LinkWithOutPrefetch}
      href={getNewsRoute(article.gid)}
      padding="sm"
      radius="md"
      withBorder
      ta={isOlder ? "right" : "left"}
      // Older stays in the right column even without a newer article.
      style={isOlder ? { gridColumn: "-2" } : undefined}
    >
      <Group gap={4} justify={isOlder ? "flex-end" : "flex-start"}>
        {!isOlder && <Arrow size={14} />}
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {t(isOlder ? "olderArticle" : "newerArticle")}
        </Text>
        {isOlder && <Arrow size={14} />}
      </Group>
      <Text fw={600} lineClamp={2} className={classes.whiteColor}>
        {article.title}
      </Text>
    </Card>
  );
};

const NewsArticlePage: NextPage<NewsArticlePageProps> = ({
  item,
  description,
  newerItem,
  olderItem,
}) => {
  const { t } = useTranslation("news");
  const { locale = "en" } = useRouter();

  useEffect(() => {
    AnalyticsNewsArticleView(item.gid);
  }, [item.gid]);

  const seoProps = createPageSEO(t, "news", getNewsRoute(item.gid));
  // Local news images are site relative, Open Graph needs an absolute URL.
  const image = item.image?.startsWith("/") ? `${config.SITE_URL}${item.image}` : item.image;

  return (
    <>
      <NextSeo
        {...seoProps}
        title={item.title}
        description={description}
        openGraph={{
          ...seoProps.openGraph,
          title: item.title,
          description,
          type: "article",
          article: {
            publishedTime: dayjs((item.date || 0) * 1000).toISOString(),
            ...(item.author ? { authors: [item.author] } : {}),
          },
          images: image ? [{ url: image, alt: item.title }] : seoProps.openGraph?.images,
        }}
      />
      <Container size={"md"} px={0}>
        <Button
          component={LinkWithOutPrefetch}
          href={getNewsRoute()}
          variant="subtle"
          size="compact-md"
          leftSection={<IconArrowLeft size={16} />}
          mb="sm"
        >
          {t("allNews")}
        </Button>
        <Card shadow="sm" padding="md" pt={"xs"} radius="md" withBorder>
          <Flex justify={"space-between"} gap="sm">
            <Title order={1} size="h2" className={classes.whiteColor}>
              {item.title}
            </Title>
            {item.url && (
              <Anchor href={item.url} target={"_blank"}>
                <IconShare3 className={classes.whiteColor} />
              </Anchor>
            )}
          </Flex>
          <NewsArticleMeta item={item} t={t} locale={locale} linkCategory />
          <NewsArticleBody contents={item.contents} />
        </Card>
        {(newerItem || olderItem) && (
          <SimpleGrid cols={{ base: 1, sm: 2 }} mt="lg" data-testid="news-article-neighbours">
            {newerItem && <NeighbourArticleCard article={newerItem} direction="newer" t={t} />}
            {olderItem && <NeighbourArticleCard article={olderItem} direction="older" t={t} />}
          </SimpleGrid>
        )}
        <Group justify="center" mt="lg" mb="md">
          <Button
            component={LinkWithOutPrefetch}
            href={getNewsRoute()}
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
          >
            {t("allNews")}
          </Button>
        </Group>
      </Container>
    </>
  );
};

export default NewsArticlePage;
