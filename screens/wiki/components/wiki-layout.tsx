import React from "react";
import { Button, Drawer, Group, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMenu2 } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { WikiNavCategory } from "../../../src/wiki/get-wiki";
import { WikiHeading } from "../../../src/wiki/wiki-types";
import { WikiBreadcrumbs, WikiCrumb } from "./wiki-breadcrumbs";
import { WikiSidebar } from "./wiki-sidebar";
import { WikiToc } from "./wiki-toc";
import classes from "../Wiki.module.css";

/**
 * Breadcrumbs on top, then the sidebar | content | "On this page" columns.
 * On tablets the TOC column is dropped, on phones the sidebar moves into a drawer.
 */
export const WikiLayout = ({
  breadcrumbs,
  navigation,
  currentCategory,
  currentArticle,
  headings,
  children,
}: {
  breadcrumbs: WikiCrumb[];
  navigation: WikiNavCategory[];
  currentCategory?: string;
  currentArticle?: string;
  /** Without headings there is no TOC column. */
  headings?: WikiHeading[];
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("wiki");
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const hasToc = (headings?.length ?? 0) >= 2;

  const sidebar = (onNavigate?: () => void) => (
    <WikiSidebar
      navigation={navigation}
      currentCategory={currentCategory}
      currentArticle={currentArticle}
      homeLabel={t("home")}
      overviewLabel={t("overview")}
      onNavigate={onNavigate}
    />
  );

  return (
    <div data-testid="wiki-layout">
      <Group justify="space-between" mb="md" mt="xs" wrap="nowrap" gap="xs">
        <WikiBreadcrumbs items={breadcrumbs} />
        <Button
          className={classes.mobileBar}
          variant="light"
          size="compact-sm"
          leftSection={<IconMenu2 size={16} />}
          onClick={open}
          style={{ flexShrink: 0 }}
          data-testid="wiki-mobile-menu"
        >
          {t("browse")}
        </Button>
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={close}
        title={t("title")}
        size="xs"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {sidebar(close)}
      </Drawer>

      <div className={classes.layout} data-no-toc={!hasToc || undefined}>
        <aside className={`${classes.sidebarColumn} ${classes.sticky}`}>{sidebar()}</aside>
        <div style={{ minWidth: 0 }}>{children}</div>
        {hasToc && headings && (
          <aside className={`${classes.tocColumn} ${classes.sticky}`}>
            <WikiToc headings={headings} title={t("onThisPage")} />
          </aside>
        )}
      </div>
    </div>
  );
};
