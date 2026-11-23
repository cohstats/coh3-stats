import React from "react";
import Link from "next/link";
import { Anchor, Breadcrumbs, Text } from "@mantine/core";

export type WikiCrumb = { label: string; href?: string };

/** The last crumb is the current page and is not a link. */
export const WikiBreadcrumbs = ({ items }: { items: WikiCrumb[] }) => (
  <Breadcrumbs
    separator="/"
    separatorMargin={6}
    data-testid="wiki-breadcrumbs"
    styles={{ root: { flexWrap: "wrap", rowGap: 4 } }}
  >
    {items.map((item) =>
      item.href ? (
        <Anchor key={item.label} component={Link} href={item.href} size="sm">
          {item.label}
        </Anchor>
      ) : (
        <Text key={item.label} size="sm" c="dimmed" lineClamp={1}>
          {item.label}
        </Text>
      ),
    )}
  </Breadcrumbs>
);
