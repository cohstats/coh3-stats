import { Image, Paper, Title, Text, rem, Anchor, useMantineTheme } from "@mantine/core";
import React, { useRef } from "react";
import { COH3SteamNewsType } from "../../../src/apis/steam-api";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getNewsRoute } from "../../../src/routes";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";

const NewsCard = ({ title, image, gid }: { title: string; image: string; gid: string }) => {
  const theme = useMantineTheme();

  return (
    <>
      <Anchor
        href={getNewsRoute(gid)}
        component={LinkWithOutPrefetch}
        style={{ textDecoration: "none" }}
      >
        <Paper
          shadow="md"
          p="md"
          radius="md"
          style={{
            height: "100%",
            backgroundImage: `url('${image}')`,
            backgroundSize: "cover",
          }}
        >
          <Title
            order={2}
            style={{
              fontFamily: `Greycliff CF, ${theme.fontFamily}`,
              fontWeight: 800,
              color: "white",
              lineHeight: 1,
              fontSize: rem(28),
              marginTop: 0,
              textShadow:
                "1px 1px 1px var(--mantine-color-dark-6), -1px -1px 1px var(--mantine-color-dark-6), 1px -1px 1px var(--mantine-color-dark-6), -1px 1px 1px var(--mantine-color-dark-6)",
            }}
          >
            {title}
          </Title>
          <Text
            style={{
              color: "white",
              fontSize: rem(18),
              fontWeight: 700,
              marginTop: theme.spacing.xs,
              textShadow:
                "1px 1px 1px var(--mantine-color-dark-6), -1px -1px 1px var(--mantine-color-dark-6), 1px -1px 1px var(--mantine-color-dark-6), -1px 1px 1px var(--mantine-color-dark-6)",
            }}
          >
            News
          </Text>
        </Paper>
      </Anchor>
    </>
  );
};

export const NewsSection: React.FC<{ steamNewsData: COH3SteamNewsType | null }> = ({
  steamNewsData,
}) => {
  if (!steamNewsData) {
    return (
      <Image
        src="/images/coh3-background-cropped.webp"
        alt={"coh3-background"}
        radius="md"
        height={"19rem"}
      />
    );
  }

  const autoplay = useRef(Autoplay({ delay: 5000, stopOnMouseEnter: true }));

  const slides = steamNewsData.newsitems.map((news) => {
    return (
      <Carousel.Slide key={news.title}>
        <NewsCard
          title={news.title}
          image={news.image || "/images/coh3-background-cropped.webp"}
          gid={news.gid}
        />
      </Carousel.Slide>
    );
  });

  return (
    <>
      <Carousel
        height={"15.5rem"}
        loop
        withControls={false}
        withIndicators
        plugins={[autoplay.current]}
        styles={{
          indicator: {
            width: rem(42),
            height: rem(10),
            // transition: 'width 250ms ease',

            // '&[data-active]': {
            //   width: rem(45),
            // },
          },
        }}
      >
        {slides}
      </Carousel>
    </>
  );
};
