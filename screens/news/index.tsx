import { COH3SteamNewsType, NewsItem } from "../../src/apis/steam-api";

import BBCode from "@bbob/react";

import reactPreset from "@bbob/preset-react";

import React, { useEffect } from "react";
import {
  Anchor,
  Card,
  Container,
  Image,
  Space,
  Title,
  Text,
  AspectRatio,
  Flex,
} from "@mantine/core";
import dayjs from "dayjs";
import { IconShare3 } from "@tabler/icons-react";
// import {AnalyticsNewsPageView} from "../../src/firebase/analytics";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import { createPageSEO } from "../../src/seo-utils";
import classes from "./News.module.css";
import { AnalyticsNewsPageView } from "../../src/firebase/analytics";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { imageUrlTransform } from "../../src/utils";

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
    // Get image URL from content or src attribute if content is empty
    const imageUrl = node.content.length > 0 ? node.content : node.attrs?.src;

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
        content: {
          tag: "iframe",
          attrs: {
            src: `https://www.youtube.com/embed/${youtubeId}`,
            frameBorder: "0",
            allowFullScreen: true,
          },
        },
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

const SingleNewsItem = ({
  item,
  t,
  locale,
}: {
  item: NewsItem;
  t: (key: string) => string;
  locale: string;
}) => {
  try {
    return (
      <Card shadow="sm" padding="md" pt={"xs"} radius="md" mb={"lg"} withBorder>
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
          <Anchor href={`#${item.gid}`} style={{ textDecoration: "none" }}>
            <Title order={2} className={classes.whiteColor}>
              {item.title}
            </Title>
          </Anchor>
          <Anchor href={item.url} target={"_blank"}>
            <IconShare3 className={classes.whiteColor} />
          </Anchor>
        </Flex>
        <Text fz="lg">
          {t("postedBy")} {item.author} {t("on")}{" "}
          {dayjs((item.date || 0) * 1000)
            .locale(locale)
            .format("DD/MMM/YYYY")}
        </Text>
        <div>
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
                ],
              }}
            >
              {item.contents}
            </BBCode>
          </NewsComponentErrorBoundary>
        </div>
      </Card>
    );
  } catch (e) {
    return null;
  }
};

const SteamNewsPage: NextPage<{ COH3SteamNews: COH3SteamNewsType }> = ({ COH3SteamNews }) => {
  const { t } = useTranslation("news");
  const { locale } = useRouter();

  useEffect(() => {
    AnalyticsNewsPageView();
  }, []);

  const items = COH3SteamNews.newsitems.map((item) => {
    return <SingleNewsItem item={item} key={item.date} t={t} locale={locale || "en"} />;
  });
  const image = COH3SteamNews.newsitems[0]?.image || "";

  // Create SEO props for news page
  const seoProps = createPageSEO(t, "news", "/news");

  try {
    return (
      <>
        <NextSeo
          {...seoProps}
          openGraph={{
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
          }}
        />
        <Container size={"md"} px={0}>
          <Title>{t("pageTitle")}</Title>
          <Space h={"lg"} />
          {items}
          <Text style={{ textAlign: "center" }} fs={"italic"} c="dimmed">
            {t("sourceText")}
            <br />
            {t("findGamesOn")}{" "}
            <Anchor href={"https://store.steampowered.com/news/app/1677280"} target={"_blank"}>
              {t("steamNewsLink")}
            </Anchor>
          </Text>
        </Container>
      </>
    );
  } catch (e) {
    return <></>;
  }
};

export default SteamNewsPage;
