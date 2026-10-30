import BBCode from "@bbob/react";
import reactPreset from "@bbob/preset-react";
import React from "react";
import { Anchor, AspectRatio, Badge, Group, Image, Text } from "@mantine/core";
import dayjs from "dayjs";
import { NewsItem } from "../../src/apis/steam-api";
import { NewsCategory } from "../../src/news/news-categories";
import { imageUrlTransform } from "../../src/utils";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";

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

const preset = reactPreset.extend((tags: any) => ({
  ...tags,
  url: (node: { attrs: NonNullable<unknown>; content: any }) => {
    return {
      tag: Anchor,
      attrs: {
        href: Object.keys(node.attrs)[0] || null,
        target: "_blank",
      },
      content: node.content,
    };
  },
  img: (node: { attrs: Record<string, string>; content: any }) => {
    // bbob provides content as an array of child nodes (usually a single string URL)
    const rawContent = Array.isArray(node.content) ? node.content.join("") : node.content;
    const imageUrl =
      typeof rawContent === "string" && rawContent.length > 0 ? rawContent : node.attrs?.src;

    return {
      tag: Image,
      attrs: {
        pt: "sm",
        pb: "sm",
        // The radius doesn't work for some reason
        // radius: "md",
        // w: "auto",
        fit: "contain",
        src: imageUrlTransform(imageUrl),
        alt: "news image",
        // Most images are further down the page, the list shows 10 articles.
        loading: "lazy",
      },
    };
  },
  br: () => {
    return {
      tag: "br",
    };
  },
  previewyoutube: (node: { attrs: NonNullable<unknown> }) => {
    try {
      const youtubeId = Object.keys(node.attrs)[0]?.split(";")[0] || null;

      return {
        tag: AspectRatio,
        attrs: {
          ratio: 16 / 9,
        },
        // bbob only renders array content; a single node object is silently dropped
        content: [
          {
            tag: "iframe",
            attrs: {
              src: `https://www.youtube.com/embed/${youtubeId}`,
              frameBorder: "0",
              allowFullScreen: true,
              loading: "lazy",
            },
          },
        ],
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  // Custom list handler to properly handle nested content in list items
  list: (node: { attrs: Record<string, string>; content: any }) => {
    const processListContent = (content: any[]): any[] => {
      if (!Array.isArray(content)) return content;

      return content.reduce((acc: any[], item: any) => {
        // Handle [*] tags with nested content
        if (item && typeof item === "object" && item.tag === "*") {
          acc.push({
            tag: "li",
            attrs: {},
            content: item.content || [],
          });
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
    };

    const type = node.attrs && Object.keys(node.attrs)[0];
    return {
      tag: type ? "ol" : "ul",
      attrs: type ? { type } : {},
      content: processListContent(node.content || []),
    };
  },
  // Custom asterisk handler for list items
  "*": (node: { content: any }) => {
    return {
      tag: "li",
      attrs: {},
      content: node.content || [],
    };
  },
  // Custom handler for dynamiclink tags
  dynamiclink: (node: { attrs: Record<string, string> }) => {
    const href = node.attrs?.href || "";
    return {
      tag: Anchor,
      attrs: {
        href: href,
        target: "_blank",
      },
      content: [href],
    };
  },
}));

class NewsComponentErrorBoundary extends React.Component {
  // @ts-ignore
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong when rendering this new.</h1>;
    }

    // @ts-ignore
    return this.props.children;
  }
}

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
  return (
    <NewsComponentErrorBoundary>
      <BBCode
        plugins={[preset()]}
        options={{
          onlyAllowTags: [
            "img",
            "url",
            "h1",
            "h2",
            "h3",
            "i",
            "list",
            "*",
            "strike",
            "u",
            "b",
            "p",
            "hr",
            "code",
            "table",
            "tr",
            "th",
            "td",
            "br",
            "quote",
            "center",
            "left",
            "right",
            "justify",
            "color",
            "size",
            "font",
            "email",
            "link",
            "youtube",
            "video",
            "audio",
            "soundcloud",
            "vimeo",
            "twitch",
            "dailymotion",
            "spotify",
            "iframe",
            "previewyoutube",
            "dynamiclink",
          ],
        }}
      >
        {contents}
      </BBCode>
    </NewsComponentErrorBoundary>
  );
};
