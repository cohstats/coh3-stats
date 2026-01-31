import { Image, Paper, Title, Text, rem, Anchor, useMantineTheme } from "@mantine/core";
import React, { useRef } from "react";
import { COH3SteamNewsType } from "../../../src/apis/steam-api";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getNewsRoute } from "../../../src/routes";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { TFunction } from "next-i18next";
import { imageUrlTransform } from "../../../src/utils";

interface NewsCardProps {
  title: string;
  image: string;
  gid: string;
  t: TFunction;
}

const NewsCard = ({ title, image, gid, t }: NewsCardProps) => {
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
            {t("sections.news.newsLabel")}
          </Text>
        </Paper>
      </Anchor>
    </>
  );
};

interface NewsSectionProps {
  steamNewsData: COH3SteamNewsType | null;
  t: TFunction;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ steamNewsData, t }) => {
  if (!steamNewsData) {
    return (
      <Image
        src="/images/coh3-background-cropped.webp"
        alt={"coh3-background"}
        radius="md"
        h={"19rem"}
      />
    );
  }

  const autoplay = useRef(Autoplay({ delay: 5000, stopOnMouseEnter: true }));

  const slides = steamNewsData.newsitems.map((news) => {
    return (
      <Carousel.Slide key={news.title}>
        <NewsCard
          title={news.title}
          image={imageUrlTransform(news.image) || "/images/coh3-background-cropped.webp"}
          gid={news.gid}
          t={t}
        />
      </Carousel.Slide>
    );
  });

  return (
    <>
      <Carousel
        height={"15.5rem"}
        emblaOptions={{ loop: true }}
        withControls={false}
        withIndicators
        plugins={[autoplay.current]}
        data-testid="news-carousel"
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
