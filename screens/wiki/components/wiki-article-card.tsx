import React from "react";
import Link from "next/link";
import { Badge, Card, Group, Image, Text } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { WikiArticleLink } from "../../../src/wiki/get-wiki";
import { getWikiRoute } from "../../../src/routes";
import classes from "../Wiki.module.css";

export const WikiArticleCard = ({
  article,
  minutesLabel,
  partLabel,
  metaIcon = <IconClock size={14} />,
}: {
  article: WikiArticleLink;
  /** "5 min read", nothing is shown without it. */
  minutesLabel?: string;
  /** "Part 2" when the article belongs to a series. */
  partLabel?: string;
  /** The icon before `minutesLabel`, a clock by default. */
  metaIcon?: React.ReactNode;
}) => (
  <Card
    component={Link}
    href={getWikiRoute(article.category, article.slug)}
    withBorder
    radius="md"
    padding="md"
    className={classes.card}
    data-testid={`wiki-article-card-${article.slug}`}
  >
    {article.image && (
      <Card.Section>
        <Image src={article.image} alt="" className={classes.cardImage} loading="lazy" />
      </Card.Section>
    )}
    <Group gap="xs" mt={article.image ? "sm" : 0} mb={4}>
      {partLabel && (
        <Badge size="sm" variant="light">
          {partLabel}
        </Badge>
      )}
      {minutesLabel && (
        <Group gap={4} c="dimmed">
          {metaIcon}
          <Text size="xs">{minutesLabel}</Text>
        </Group>
      )}
    </Group>
    <Text fw={700} className={classes.whiteColor}>
      {article.title}
    </Text>
    <Text size="sm" c="dimmed" lineClamp={3} mt={4}>
      {article.summary}
    </Text>
  </Card>
);
