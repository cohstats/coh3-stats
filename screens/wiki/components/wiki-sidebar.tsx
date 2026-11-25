import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, NavLink, Stack, ThemeIcon } from "@mantine/core";
import { IconBooks, IconFileText, IconLayoutGrid } from "@tabler/icons-react";
import { WikiArticleLink, WikiNavCategory } from "../../../src/wiki/get-wiki";
import { getWikiRoute } from "../../../src/routes";
import { WikiCategoryIcon } from "./wiki-category-icon";
import classes from "../Wiki.module.css";

const ArticleLink = ({
  article,
  active,
  onNavigate,
}: {
  article: WikiArticleLink;
  active: boolean;
  onNavigate?: () => void;
}) => (
  <NavLink
    component={Link}
    href={getWikiRoute(article.category, article.slug)}
    label={article.title}
    leftSection={
      article.seriesPart ? (
        <span className={classes.navPart}>{article.seriesPart}</span>
      ) : (
        <IconFileText size={16} stroke={1.6} className={classes.navArticleIcon} />
      )
    }
    active={active}
    onClick={onNavigate}
    className={classes.navArticle}
    data-testid={`wiki-sidebar-article-${article.slug}`}
  />
);

/**
 * Category -> group -> article tree. Every level sits on its own guide line, groups are
 * collapsed unless they hold the current article, and series articles show their part number.
 */
export const WikiSidebar = ({
  navigation,
  currentCategory,
  currentArticle,
  homeLabel,
  overviewLabel,
  onNavigate,
}: {
  navigation: WikiNavCategory[];
  currentCategory?: string;
  currentArticle?: string;
  homeLabel: string;
  overviewLabel: string;
  /** Closes the mobile drawer. */
  onNavigate?: () => void;
}) => {
  // The sidebar stays mounted between articles, so the group of the current article is opened
  // on every navigation. Groups the reader opened or closed by hand keep their state.
  const currentGroupKey = (() => {
    const category = navigation.find((item) => item.slug === currentCategory);
    const group = category?.groups.find((item) =>
      item.articles.some((article) => article.slug === currentArticle),
    );
    return category && group ? `${category.slug}/${group.id}` : null;
  })();
  const [openGroups, setOpenGroups] = useState<string[]>(
    currentGroupKey ? [currentGroupKey] : [],
  );

  useEffect(() => {
    if (!currentGroupKey) return;
    setOpenGroups((open) => (open.includes(currentGroupKey) ? open : [...open, currentGroupKey]));
  }, [currentGroupKey]);

  const toggleGroup = (key: string, opened: boolean) =>
    setOpenGroups((open) =>
      opened ? [...open, key] : open.filter((openKey) => openKey !== key),
    );

  return (
    <Stack gap={4} component="nav" aria-label={homeLabel} data-testid="wiki-sidebar">
      <NavLink
        component={Link}
        href={getWikiRoute()}
        label={homeLabel}
        leftSection={<IconBooks size={18} stroke={1.7} />}
        active={!currentCategory}
        onClick={onNavigate}
        fw={600}
      />
      {navigation.map((category) => {
        const isCurrent = category.slug === currentCategory;
        return (
          <NavLink
            key={category.slug}
            label={category.title}
            leftSection={
              <ThemeIcon size="sm" variant="light" color={category.color}>
                <WikiCategoryIcon icon={category.icon} size={14} />
              </ThemeIcon>
            }
            defaultOpened={isCurrent || !currentCategory}
            childrenOffset={0}
            className={classes.navCategory}
            data-testid={`wiki-sidebar-category-${category.slug}`}
          >
            <div className={classes.navTree}>
              <NavLink
                component={Link}
                href={getWikiRoute(category.slug)}
                label={overviewLabel}
                leftSection={
                  <IconLayoutGrid size={16} stroke={1.6} className={classes.navArticleIcon} />
                }
                active={isCurrent && !currentArticle}
                onClick={onNavigate}
                className={classes.navArticle}
              />
              {category.groups.map((group) =>
                group.title ? (
                  <NavLink
                    key={group.id}
                    label={
                      <span className={classes.navGroupLabel}>
                        {group.title}
                        <Badge size="xs" variant="light" color={category.color} circle>
                          {group.articles.length}
                        </Badge>
                      </span>
                    }
                    opened={openGroups.includes(`${category.slug}/${group.id}`)}
                    onChange={(opened) => toggleGroup(`${category.slug}/${group.id}`, opened)}
                    childrenOffset={0}
                    className={classes.navGroup}
                    data-testid={`wiki-sidebar-group-${group.id}`}
                  >
                    <div className={classes.navTree}>
                      {group.articles.map((article) => (
                        <ArticleLink
                          key={article.slug}
                          article={article}
                          active={isCurrent && article.slug === currentArticle}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </div>
                  </NavLink>
                ) : (
                  group.articles.map((article) => (
                    <ArticleLink
                      key={article.slug}
                      article={article}
                      active={isCurrent && article.slug === currentArticle}
                      onNavigate={onNavigate}
                    />
                  ))
                ),
              )}
            </div>
          </NavLink>
        );
      })}
    </Stack>
  );
};
