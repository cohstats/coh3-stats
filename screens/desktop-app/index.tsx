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
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { AnalyticsDesktopAppPageView } from "../../src/firebase/analytics";

import classes from "./desktop-app.module.css";
import { generateAlternateLanguageLinks } from "../../src/head-utils";
import { useRouter } from "next/router";

const DesktopAppPage: NextPage = ({ downloadURL, downloadCount, version }: any) => {
  const { t } = useTranslation("desktopapp");
  const { asPath } = useRouter();

  useEffect(() => {
    AnalyticsDesktopAppPageView();
  }, []);

  return (
    <>
      <Head>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description", { version })} />
        <meta name="keywords" content={t("meta.keywords")} />
        <meta property="og:image" content="/desktop-app/desktop-app-v2.webp" />
        {generateAlternateLanguageLinks(asPath)}
      </Head>
      <Container size={"lg"}>
        <Title>{t("title")}</Title>
        <Title order={2}>{t("subtitle")}</Title>
        <div className={classes["desktop-app-image-container"]}>
          <Image
            src="/desktop-app/desktop-app-loading-v2.webp"
            alt={"coh3 stats desktop app loading image"}
            radius="md"
            mx="auto"
            className={classes["desktop-app-loading-image"]}
          />
          <Image
            src="/desktop-app/desktop-app-v2.webp"
            alt={"coh3 stats desktop app"}
            radius="md"
            mx="auto"
            className={classes["desktop-app-image"]}
          />
        </div>
        <Paper radius="md" mt="md" p="lg">
          <Stack align="center" gap={5} mb={30}>
            <Anchor
              href={downloadURL}
              target="_blank"
              rel="noopener"
              download
              type="application/x-msi"
              aria-label={t("download.buttonAriaLabel", { version })}
            >
              <Button size={"lg"}>{t("download.button", { version })}</Button>
            </Anchor>
            <Text size="sm" c="dimmed">
              {t("download.downloads", { count: downloadCount })}
            </Text>
            <Anchor
              href="https://github.com/cohstats/coh3-stats-desktop-app/releases/latest"
              target="_blank"
              rel="noopener"
            >
              {t("download.releaseNotes")}
            </Anchor>
          </Stack>
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
