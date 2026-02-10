import {
  Anchor,
  Button,
  Container,
  Image,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Grid,
  rem,
} from "@mantine/core";
import { IconCheck, IconBrandWindows, IconDownload } from "@tabler/icons-react";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import config from "../../config";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { AnalyticsDesktopAppPageView } from "../../src/firebase/analytics";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";

import classes from "./desktop-app.module.css";
import { createPageSEO } from "../../src/seo-utils";

const DesktopAppPage: NextPage = ({
  downloadURL,
  downloadCount,
  totalDownloadCount,
  version,
}: any) => {
  const { t } = useTranslation("desktopapp");
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnMouseEnter: true }));

  useEffect(() => {
    AnalyticsDesktopAppPageView();
  }, []);

  // Create SEO props for desktop app page
  const seoProps = createPageSEO(t, "desktopapp", "/desktop-app", { version });

  // Carousel images
  const carouselImages = [
    { src: "/images/desktop-app-carousel/overview.png", alt: "Desktop App Overview" },
    { src: "/images/desktop-app-carousel/overview-bottom.png", alt: "Overview Bottom" },
    { src: "/images/desktop-app-carousel/recent-games.png", alt: "Recent Games" },
    { src: "/images/desktop-app-carousel/match-details.png", alt: "Match Details" },
    { src: "/images/desktop-app-carousel/leaderboards.png", alt: "Leaderboards View" },
    { src: "/images/desktop-app-carousel/settings.png", alt: "Settings" },
  ];

  const carouselSlides = carouselImages.map((image, index) => (
    <Carousel.Slide key={index}>
      <div
        style={{ height: "390px", overflow: "hidden", display: "flex", alignItems: "flex-start" }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          radius="md"
          fit="contain"
          style={{ width: "100%" }}
        />
      </div>
    </Carousel.Slide>
  ));

  return (
    <>
      <NextSeo
        {...seoProps}
        openGraph={{
          ...seoProps.openGraph,
          images: [
            {
              url: `${config.SITE_URL}/desktop-app/desktop-app-v2.webp`,
              width: 600,
              height: 336,
              alt: "Grenadier - COH3 Companion",
            },
          ],
        }}
      />
      <Container size={"lg"}>
        <Title>{t("title")}</Title>
        <Title order={2}>{t("subtitle")}</Title>

        {/* Image Carousel */}
        <Paper radius="md" mt="md" p="md">
          <Carousel
            height={390}
            emblaOptions={{ loop: true }}
            withControls={false}
            withIndicators
            plugins={[autoplay.current]}
            styles={{
              indicator: {
                width: rem(25),
                height: rem(10),
                transition: "width 250ms ease",
                "&[data-active]": {
                  width: rem(40),
                },
              },
            }}
          >
            {carouselSlides}
          </Carousel>
        </Paper>

        {/* Download Buttons Section */}
        <Paper radius="md" mt="md" p="lg">
          <Grid gutter="xl" align="center">
            {/* Left Column - Download Buttons */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack align="center" gap="sm" justify="center" style={{ height: "100%" }}>
                {/* Microsoft Store Button */}
                <Anchor
                  href="https://apps.microsoft.com/detail/9PBKK60PKDQS"
                  target="_blank"
                  rel="noopener"
                  aria-label={t("download.microsoftStoreAriaLabel")}
                >
                  <Button size="lg" variant="filled" leftSection={<IconBrandWindows size={20} />}>
                    {t("download.microsoftStore")}
                  </Button>
                </Anchor>

                {/* OR Divider */}
                <Text size="lg" fw={700} c="dimmed">
                  {t("download.or")}
                </Text>

                {/* Free Download Button */}
                <Stack align="center" gap="xs">
                  <Anchor
                    href={downloadURL}
                    target="_blank"
                    rel="noopener"
                    download
                    type="application/x-msi"
                    aria-label={t("download.buttonAriaLabel", { version })}
                  >
                    <Button size="lg" variant="outline" leftSection={<IconDownload size={20} />}>
                      {t("download.button", { version })}
                    </Button>
                  </Anchor>
                  <Stack align="center" gap="0">
                    <Text size="sm" c="dimmed">
                      {t("download.downloads", { count: downloadCount })}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t("download.totalDownloads", { count: totalDownloadCount })}
                    </Text>
                  </Stack>
                </Stack>
                <Anchor
                  href="https://github.com/cohstats/coh3-stats-desktop-app/releases/latest"
                  target="_blank"
                  rel="noopener"
                >
                  {t("download.releaseNotes")}
                </Anchor>
              </Stack>
            </Grid.Col>

            {/* Right Column - Download Options Comparison */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Paper p="md" withBorder radius="md">
                  <Title order={4} mb="md">
                    {t("downloadOptions.microsoftStore.title")}
                  </Title>
                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon size={20} radius="xl" className={classes["list-icon"]}>
                        <IconCheck stroke={1.5} />
                      </ThemeIcon>
                    }
                  >
                    {(
                      t("downloadOptions.microsoftStore.benefits", {
                        returnObjects: true,
                      }) as string[]
                    ).map((benefit: string, index: number) => (
                      <List.Item key={index}>{benefit}</List.Item>
                    ))}
                  </List>
                </Paper>

                <Paper p="md" withBorder radius="md">
                  <Title order={4} mb="md">
                    {t("downloadOptions.freeDownload.title")}
                  </Title>
                  <List
                    spacing="xs"
                    size="sm"
                    icon={
                      <ThemeIcon size={20} radius="xl" className={classes["list-icon"]}>
                        <IconCheck stroke={1.5} />
                      </ThemeIcon>
                    }
                  >
                    {(
                      t("downloadOptions.freeDownload.benefits", {
                        returnObjects: true,
                      }) as string[]
                    ).map((benefit: string, index: number) => (
                      <List.Item key={index}>{benefit}</List.Item>
                    ))}
                  </List>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Features Section */}
        <Paper radius="md" mt="md" p="lg">
          <Title order={3}>{t("features.title")}</Title>
          <List
            spacing="sm"
            mt={"md"}
            icon={
              <ThemeIcon size={20} radius="xl" className={classes["list-icon"]}>
                <IconCheck stroke={1.5} />
              </ThemeIcon>
            }
          >
            <List.Item>{t("features.list.noSetup")}</List.Item>
            <List.Item>{t("features.list.leaderboard")}</List.Item>
            <List.Item>{t("features.list.teams")}</List.Item>
            <List.Item>{t("features.list.recentGames")}</List.Item>
            <List.Item>{t("features.list.notifications")}</List.Item>
            <List.Item>{t("features.list.replays")}</List.Item>
            <List.Item>{t("features.list.muteOnFocusLoss")}</List.Item>
            <List.Item>
              {t("features.list.streaming.before")}{" "}
              <Anchor href="https://obsproject.com/" target="_blank" rel="noopener">
                OBS
              </Anchor>{" "}
              {t("features.list.streaming.and")}{" "}
              <Anchor
                href="https://www.twitch.tv/broadcast/studio"
                target="_blank"
                rel="noopener"
              >
                Twitch Studio
              </Anchor>{" "}
              {t("features.list.streaming.after")}
            </List.Item>
          </List>
        </Paper>
      </Container>
    </>
  );
};

export default DesktopAppPage;
