import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Image,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  rem,
} from "@mantine/core";
import { IconCheck, IconMinus, IconBrandWindows, IconDownload } from "@tabler/icons-react";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import config from "../../config";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "next-i18next/pages";
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

  // Streamer overlay feature contains links, so it's rendered as a node
  const streamingFeature = (
    <>
      {t("features.list.streaming.before")}{" "}
      <Anchor href="https://obsproject.com/" target="_blank" rel="noopener">
        OBS
      </Anchor>{" "}
      {t("features.list.streaming.and")}{" "}
      <Anchor href="https://www.twitch.tv/broadcast/studio" target="_blank" rel="noopener">
        Twitch Studio
      </Anchor>{" "}
      {t("features.list.streaming.after")}
    </>
  );

  // Feature comparison - `free` marks whether the feature is part of the free version,
  // all of them are always part of the Microsoft Store version
  const features: Array<{ key: string; label: React.ReactNode; free: boolean }> = [
    { key: "noSetup", label: t("features.list.noSetup"), free: true },
    { key: "leaderboard", label: t("features.list.leaderboard"), free: true },
    { key: "teams", label: t("features.list.teams"), free: true },
    { key: "recentGames", label: t("features.list.recentGames"), free: true },
    { key: "notifications", label: t("features.list.notifications"), free: true },
    { key: "muteOnFocusLoss", label: t("features.list.muteOnFocusLoss"), free: true },
    { key: "streaming", label: streamingFeature, free: true },
    { key: "friendsGroup", label: t("features.list.friendsGroup"), free: false },
    { key: "loadingOverlay", label: t("features.list.loadingOverlay"), free: false },
  ];

  const includedIcon = (
    <IconCheck size={20} stroke={2.5} className={classes["icon-included"]} aria-hidden />
  );
  const excludedIcon = (
    <IconMinus size={20} stroke={2.5} className={classes["icon-excluded"]} aria-hidden />
  );

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
            data-testid="desktop-app-carousel"
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

        {/* Version comparison with download options */}
        <Paper radius="md" mt="md" p="lg">
          <Title order={3} mb="md">
            {t("comparison.title")}
          </Title>

          <Table.ScrollContainer minWidth={620} type="native">
            <Table
              data-testid="comparison-table"
              verticalSpacing="xs"
              horizontalSpacing="md"
              withRowBorders={false}
              className={classes["comparison-table"]}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={classes["feature-column"]}>
                    <Text fw={700} size="lg">
                      {t("comparison.featureColumn")}
                    </Text>
                  </Table.Th>
                  <Table.Th className={classes["option-column"]}>
                    <Stack gap={2} align="center">
                      {/* Empty slot keeps both column titles on the same line */}
                      <Box h={rem(22)} />
                      <Text fw={700} size="lg">
                        {t("comparison.free.title")}
                      </Text>
                      <Text size="xs" c="dimmed" fw={400} ta="center">
                        {t("comparison.free.subtitle")}
                      </Text>
                    </Stack>
                  </Table.Th>
                  <Table.Th className={`${classes["option-column"]} ${classes["store-column"]}`}>
                    <Stack gap={2} align="center">
                      <Badge size="sm" variant="filled" h={rem(22)}>
                        {t("comparison.recommended")}
                      </Badge>
                      <Text fw={700} size="lg">
                        {t("comparison.microsoftStore.title")}
                      </Text>
                      <Text size="xs" c="dimmed" fw={400} ta="center">
                        {t("comparison.microsoftStore.subtitle")}
                      </Text>
                    </Stack>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {features.map((feature) => (
                  <Table.Tr key={feature.key} data-testid="comparison-feature-row">
                    <Table.Td className={classes["feature-column"]}>{feature.label}</Table.Td>
                    <Table.Td className={classes["option-column"]}>
                      {feature.free ? includedIcon : excludedIcon}
                    </Table.Td>
                    <Table.Td
                      className={`${classes["option-column"]} ${classes["store-column"]}`}
                    >
                      {includedIcon}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>

              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td className={classes["feature-column"]}>
                    <Anchor
                      data-testid="release-notes-link"
                      href="https://github.com/cohstats/coh3-stats-desktop-app/releases/latest"
                      target="_blank"
                      rel="noopener"
                      size="sm"
                    >
                      {t("download.releaseNotes")}
                    </Anchor>
                  </Table.Td>
                  <Table.Td className={classes["option-column"]}>
                    <Stack gap={4} align="center">
                      <Anchor
                        href={downloadURL}
                        target="_blank"
                        rel="noopener"
                        download
                        type="application/x-msi"
                        aria-label={t("download.buttonAriaLabel", { version })}
                      >
                        <Button
                          data-testid="free-download-button"
                          size="md"
                          variant="outline"
                          leftSection={<IconDownload size={20} />}
                        >
                          {t("download.button", { version })}
                        </Button>
                      </Anchor>
                      <Text data-testid="download-stats" size="xs" c="dimmed">
                        {t("download.downloads", { count: downloadCount })}
                      </Text>
                      <Text data-testid="total-download-stats" size="xs" c="dimmed">
                        {t("download.totalDownloads", { count: totalDownloadCount })}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td className={`${classes["option-column"]} ${classes["store-column"]}`}>
                    <Stack gap={4} align="center">
                      <Anchor
                        href="https://apps.microsoft.com/detail/9PBKK60PKDQS"
                        target="_blank"
                        rel="noopener"
                        aria-label={t("download.microsoftStoreAriaLabel")}
                      >
                        <Button
                          data-testid="microsoft-store-button"
                          size="md"
                          variant="filled"
                          leftSection={<IconBrandWindows size={20} />}
                        >
                          {t("download.microsoftStore")}
                        </Button>
                      </Anchor>
                      <Text size="xs" c="dimmed" ta="center">
                        {t("comparison.microsoftStore.supportNote")}
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Container>
    </>
  );
};

export default DesktopAppPage;
