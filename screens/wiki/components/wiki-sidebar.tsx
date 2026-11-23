import React from "react";
import Link from "next/link";
import { NavLink, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBooks } from "@tabler/icons-react";
import { WikiNavCategory } from "../../../src/wiki/get-wiki";
import { getWikiRoute } from "../../../src/routes";
import { WikiCategoryIcon } from "./wiki-category-icon";
import classes from "../Wiki.module.css";

/** Category -> group -> article tree, the current category is open. */
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
  return (
    <Stack gap={2} component="nav" aria-label={homeLabel} data-testid="wiki-sidebar">
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
            fw={500}
            data-testid={`wiki-sidebar-category-${category.slug}`}
          >
            <NavLink
              component={Link}
              href={getWikiRoute(category.slug)}
              label={overviewLabel}
              active={isCurrent && !currentArticle}
              onClick={onNavigate}
              pl={28}
            />
            {category.groups.map((group) => (
              <React.Fragment key={group.id ?? "ungrouped"}>
                {group.title && (
                  <Text
                    size="xs"
                    c="dimmed"
                    fw={700}
                    tt="uppercase"
                    className={classes.groupLabel}
                  >
                    {group.title}
                  </Text>
                )}
                {group.articles.map((article) => (
                  <NavLink
                    key={article.slug}
                    component={Link}
                    href={getWikiRoute(article.category, article.slug)}
                    label={article.title}
                    active={isCurrent && article.slug === currentArticle}
                    onClick={onNavigate}
                    pl={28}
                    data-testid={`wiki-sidebar-article-${article.slug}`}
                  />
                ))}
              </React.Fragment>
            ))}
          </NavLink>
        );
      })}
    </Stack>
  );
};
