import { COH3SteamNewsType, NewsItem } from "../../src/apis/steam-api";

// @ts-ignore
import BBCode from "@bbob/react/lib";
// @ts-ignore
import reactPreset from "@bbob/preset-react/lib";
import React from "react";
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
  img: (node: { content: any }) => {
    return {
      tag: Image,
      attrs: {
        pt: "sm",
        pb: "sm",
        radius: "md",
        w: "auto",
        fit: "contain",
        src: node.content,
        loading: "lazy",
      },
    };
  },
  // br: (node: { content: any }) => {
  //   return {
  //     tag: "br",
  //     // attrs: {
  //     //   pt: "sm",
  //     //   pb: "sm",
  //     //   radius: "md",
  //     //   w: "auto",
  //     //   fit: "contain",
  //     //   src: node.content,
  //     //   loading: "lazy",
  //     // },
  //   };
  // },
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

const SingleNewsItem = ({ item }: { item: NewsItem }) => {
  try {
    // render the date as 05/April/2024 using dayjs

    return (
      <Card shadow="sm" padding="md" pt={"xs"} radius="md" mb={"lg"} withBorder>
        <Flex justify={"space-between"}>
          <Title order={2}>{item.title}</Title>
          <Anchor href={item.url} target={"_blank"}>
            <IconShare3 />
          </Anchor>
        </Flex>
        <Text fz="lg">
          Posted by {item.author} on {dayjs(item.date * 1000).format("DD/MMM/YYYY")}
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
  // useEffect(() => {
  //   AnalyticsNewsPageView();
  // }, []);

  const items = COH3SteamNews.newsitems.map((item) => {
    return <SingleNewsItem item={item} key={item.date} />;
  });

  try {
    return (
      <Container size={"md"} px={0}>
        <Title>Latest Company Of Heroes 3 News</Title>
        <Space h={"lg"} />
        {items}
        <Text align={"center"} fs={"italic"} c="dimmed">
          Source: Official Relic Steam News for COH3
          <br />
          You can find all the articles on{" "}
          <Anchor href={"https://store.steampowered.com/news/app/1677280"} target={"_blank"}>
            Steam news
          </Anchor>
        </Text>
      </Container>
    );
  } catch (e) {
    return <></>;
  }
};

export default SteamNewsPage;
