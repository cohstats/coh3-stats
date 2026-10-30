import { COH3SteamNewsType, NewsItem } from "../../src/apis/steam-api";

import React, { useEffect, useRef, useState } from "react";
import {
  Anchor,
  Card,
  Container,
  Title,
  Text,
  Flex,
  Pagination,
  Group,
  Badge,
  Box,
  Button,
  Center,
  SegmentedControl,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconArticle,
  IconChevronDown,
  IconChevronUp,
  IconFileDescription,
  IconList,
  IconShare3,
} from "@tabler/icons-react";
// import {AnalyticsNewsPageView} from "../../src/firebase/analytics";
import { NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { createPageSEO } from "../../src/seo-utils";
import classes from "./News.module.css";
import { AnalyticsNewsPageView } from "../../src/firebase/analytics";
import { useTranslation } from "next-i18next/pages";
import { useRouter } from "next/router";
import { NEWS_CATEGORIES, NewsCategory } from "../../src/news/news-categories";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import { getNewsRoute } from "../../src/routes";
import { getCategoryHref, NewsArticleBody, NewsArticleMeta } from "./news-article";
// Same sticky bar and buttons as the unit and search page section nav.
import navClasses from "../../components/unit-cards/unit-section-nav.module.css";

// How much of each article is shown before "Read more".
const NEWS_VIEW_MODES = ["full", "preview", "headlines"] as const;
type NewsViewMode = (typeof NEWS_VIEW_MODES)[number];
const DEFAULT_NEWS_VIEW_MODE: NewsViewMode = "preview";

const NEWS_VIEW_MODE_ICONS: Record<NewsViewMode, typeof IconArticle> = {
  full: IconArticle,
  preview: IconFileDescription,
  headlines: IconList,
};

const isNewsViewMode = (value: unknown): value is NewsViewMode =>
  typeof value === "string" && (NEWS_VIEW_MODES as readonly string[]).includes(value);

const SingleNewsItem = ({
  item,
  t,
  locale,
  viewMode,
}: {
  item: NewsItem;
  t: (key: string) => string;
  locale: string;
  viewMode: NewsViewMode;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  // Assume a long article until measured, most Steam posts are.
  const [overflows, setOverflows] = useState(true);
  const isCollapsed = viewMode !== "full" && !expanded;

  // Switching the view collapses the articles again, a direct `#gid` link opens its article.
  useEffect(() => {
    const isLinked = () => window.location.hash === `#${item.gid}`;
    setExpanded(isLinked());
    // The hash can also change while the page is open, e.g. a link pasted into the address bar.
    const expandFromHash = () => isLinked() && setExpanded(true);
    window.addEventListener("hashchange", expandFromHash);
    return () => window.removeEventListener("hashchange", expandFromHash);
  }, [viewMode, item.gid]);

  // Short articles fit into the preview, they don't need "Read more".
  useEffect(() => {
    const container = contentRef.current;
    const content = container?.firstElementChild;
    if (!container || !content || !isCollapsed) return;

    const update = () => setOverflows(content.scrollHeight > container.clientHeight + 1);
    update();
    // Images and embeds change the height once they load.
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, [isCollapsed]);

  const collapse = () => {
    setExpanded(false);
    // Keep the reader at this article instead of somewhere further down the page,
    // right below the sticky filter bar whose height depends on how it wraps.
    const cardTop = cardRef.current?.getBoundingClientRect().top ?? 0;
    const nav = document.querySelector('[data-testid="news-category-filter"]');
    const navBottom = (nav?.getBoundingClientRect().bottom ?? 0) + 12;
    if (cardTop < navBottom) {
      window.scrollBy({ top: cardTop - navBottom });
    }
  };

  try {
    return (
      <Card ref={cardRef} shadow="sm" padding="md" pt={"xs"} radius="md" mb={"lg"} withBorder>
        <span
          style={{
            position: "absolute",
            top: "-120px",
            left: "0",
            right: "0",
            height: "1px",
          }}
          id={item.gid}
        />
        <Flex justify={"space-between"}>
          <Anchor
            component={LinkWithOutPrefetch}
            href={getNewsRoute(item.gid)}
            style={{ textDecoration: "none" }}
          >
            <Title order={2} className={classes.whiteColor}>
              {item.title}
            </Title>
          </Anchor>
          {item.url && (
            <Anchor href={item.url} target={"_blank"}>
              <IconShare3 className={classes.whiteColor} />
            </Anchor>
          )}
        </Flex>
        <NewsArticleMeta item={item} t={t} locale={locale} />
        {(viewMode !== "headlines" || expanded) && (
          <div
            ref={contentRef}
            className={isCollapsed ? classes.preview : undefined}
            data-overflows={(isCollapsed && overflows) || undefined}
          >
            <div>
              <NewsArticleBody contents={item.contents} />
            </div>
          </div>
        )}
        {isCollapsed && (viewMode === "headlines" || overflows) && (
          <Group justify="center" mt="xs">
            <Button
              variant="subtle"
              size="compact-md"
              onClick={() => setExpanded(true)}
              rightSection={<IconChevronDown size={16} />}
              aria-expanded={false}
            >
              {t("readMore")}
            </Button>
          </Group>
        )}
        {viewMode !== "full" && expanded && (
          <Group justify="center" mt="xs">
            <Button
              variant="subtle"
              color="gray"
              size="compact-md"
              onClick={collapse}
              rightSection={<IconChevronUp size={16} />}
              aria-expanded={true}
            >
              {t("showLess")}
            </Button>
          </Group>
        )}
      </Card>
    );
  } catch (e) {
    return null;
  }
};

const NewsCategoryFilter = ({
  activeCategory,
  counts,
  viewMode,
  onViewModeChange,
  t,
}: {
  activeCategory: NewsCategory | null;
  counts?: Record<NewsCategory | "all", number> | null;
  viewMode: NewsViewMode;
  onViewModeChange: (viewMode: NewsViewMode) => void;
  t: (key: string) => string;
}) => {
  return (
    <Box
      component="nav"
      className={`${navClasses.nav} ${classes.newsNav}`}
      data-testid="news-category-filter"
    >
      <div className={navClasses.list}>
        {[null, ...NEWS_CATEGORIES].map((category) => {
          const isActive = category === activeCategory;
          return (
            <Button
              key={category ?? "all"}
              component={LinkWithOutPrefetch}
              href={getCategoryHref(category)}
              variant={isActive ? "light" : "subtle"}
              color={isActive ? undefined : "gray"}
              size="compact-md"
              radius="md"
              justify="flex-start"
              classNames={{
                root: navClasses.root,
                label: navClasses.label,
                section: navClasses.badge,
              }}
              aria-current={isActive ? "page" : undefined}
              rightSection={
                counts ? (
                  <Badge size="sm" variant="default" radius="sm">
                    {counts[category ?? "all"]}
                  </Badge>
                ) : undefined
              }
            >
              {t(`categories.${category ?? "all"}`)}
            </Button>
          );
        })}
      </div>
      <SegmentedControl
        className={classes.viewSwitch}
        value={viewMode}
        onChange={(value) => isNewsViewMode(value) && onViewModeChange(value)}
        aria-label={t("viewMode.label")}
        data-testid="news-view-mode"
        data={NEWS_VIEW_MODES.map((mode) => {
          const Icon = NEWS_VIEW_MODE_ICONS[mode];
          return {
            value: mode,
            label: (
              <Center style={{ gap: 6 }}>
                <Icon size={16} />
                <span>{t(`viewMode.${mode}`)}</span>
              </Center>
            ),
          };
        })}
      />
    </Box>
  );
};

const SteamNewsPage: NextPage<{
  COH3SteamNews: COH3SteamNewsType;
  category?: NewsCategory | null;
  categoryCounts?: Record<NewsCategory | "all", number> | null;
}> = ({ COH3SteamNews, category = null, categoryCounts = null }) => {
  const { t } = useTranslation("news");
  const router = useRouter();
  const { locale } = router;

  // Read after hydration, the server always renders the default view.
  const [storedViewMode, setViewMode] = useLocalStorage<NewsViewMode>({
    key: "news-view-mode",
    defaultValue: DEFAULT_NEWS_VIEW_MODE,
    getInitialValueInEffect: true,
  });
  const viewMode = isNewsViewMode(storedViewMode) ? storedViewMode : DEFAULT_NEWS_VIEW_MODE;

  useEffect(() => {
    AnalyticsNewsPageView();
  }, []);

  const items = COH3SteamNews.newsitems.map((item) => {
    return (
      <SingleNewsItem
        item={item}
        key={item.date}
        t={t}
        locale={locale || "en"}
        viewMode={viewMode}
      />
    );
  });
  const image = COH3SteamNews.newsitems[0]?.image || "";

  const currentPage = COH3SteamNews.currentPage ?? 1;
  const totalPages = COH3SteamNews.totalPages ?? 1;

  const handlePageChange = (page: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page },
    });
  };

  // Create SEO props for news page, including page parameter for paginated URLs
  const pageQuery = [
    category ? `category=${category}` : null,
    currentPage > 1 ? `page=${currentPage}` : null,
  ].filter(Boolean);
  const pagePath = pageQuery.length > 0 ? `/news?${pageQuery.join("&")}` : "/news";
  const seoProps = createPageSEO(t, "news", pagePath);

  try {
    return (
      <>
        <Head>
          {generateNextSeo({
            ...seoProps,
            openGraph: {
              ...seoProps.openGraph,
              images: image
                ? [
                    {
                      url: image,
                      width: 800,
                      height: 600,
                      alt: "COH3 News Image",
                    },
                  ]
                : seoProps.openGraph?.images,
            },
          })}
        </Head>
        <Container size={"md"} px={0}>
          <Title>{t("pageTitle")}</Title>
          <NewsCategoryFilter
            activeCategory={category}
            counts={categoryCounts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            t={t}
          />
          {items.length > 0 ? items : <Text c="dimmed">{t("noNewsInCategory")}</Text>}
          {totalPages > 1 && (
            <Group justify="center" mt="md" mb="md">
              <Pagination total={totalPages} value={currentPage} onChange={handlePageChange} />
            </Group>
          )}
        </Container>
      </>
    );
  } catch (e) {
    return <></>;
  }
};

export default SteamNewsPage;
