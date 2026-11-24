import React from "react";
import { Badge, Group, Text } from "@mantine/core";
import dayjs from "dayjs";
import { NewsItem } from "../../src/apis/steam-api";
import { NewsCategory } from "../../src/news/news-categories";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import { BBCodeBody } from "../../components/bbcode/bbcode-body";

// Shared by the news overview and the single article page.

export const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  patchNotes: "orange",
  news: "blue",
  dlcAndOffers: "grape",
  communityEvents: "teal",
  tournaments: "red",
  coh3stats: "green",
};

export const getCategoryHref = (category: NewsCategory | null) =>
  category ? `/news?category=${category}` : "/news";

/** "Posted by X on date" with the category badge, which links to its category on the article page. */
export const NewsArticleMeta = ({
  item,
  t,
  locale,
  linkCategory = false,
}: {
  item: NewsItem;
  t: (key: string) => string;
  locale: string;
  linkCategory?: boolean;
}) => {
  return (
    <Group gap="xs">
      <Text fz="lg">
        {t("postedBy")} {item.author} {t("on")}{" "}
        {dayjs((item.date || 0) * 1000)
          .locale(locale)
          .format("DD/MMM/YYYY")}
      </Text>
      {item.category &&
        (linkCategory ? (
          <Badge
            component={LinkWithOutPrefetch}
            href={getCategoryHref(item.category)}
            color={NEWS_CATEGORY_COLORS[item.category]}
            variant="light"
            style={{ cursor: "pointer" }}
          >
            {t(`categories.${item.category}`)}
          </Badge>
        ) : (
          <Badge color={NEWS_CATEGORY_COLORS[item.category]} variant="light">
            {t(`categories.${item.category}`)}
          </Badge>
        ))}
    </Group>
  );
};

/** The article text, Steam posts are BBCode. */
export const NewsArticleBody = ({ contents }: { contents?: string }) => {
  return <BBCodeBody contents={contents} />;
};
