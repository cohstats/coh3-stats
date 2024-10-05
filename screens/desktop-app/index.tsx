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
import { AnalyticsDesktopAppPageView } from "../../src/firebase/analytics";

import classes from "./desktop-app.module.css";

const DesktopAppPage: NextPage = ({ downloadURL, downloadCount, version }: any) => {
  const desktopAppDescription = `Download COH3 Stats Desktop app ${version}. No configuration required. OBS Overlay feature. Detailed info on your current match opponents. Sound notifications of new game and more.`;

  useEffect(() => {
    AnalyticsDesktopAppPageView();
  }, []);

  return (
    <>
      <Head>
        <title>Desktop App from COH3 Stats</title>
        <meta name="description" content={desktopAppDescription} />
        <meta
          name="keywords"
          content={
            "coh3, coh3 stats, coh3 desktop app, coh3 OBS overlay, company of heroes realtime info"
          }
        />
        <meta property="og:image" content="/desktop-app/desktop-app-v2.webp" />
      </Head>
      <Container size={"lg"}>
        {/*We need to fix this on both mobile and desktop to avoid CLS*/}

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
            <Anchor href={downloadURL} target="_blank">
              <Button>Download {version}</Button>
            </Anchor>
            <Text size="sm" c="dimmed">
              {downloadCount} downloads
            </Text>
            <Anchor
              href="https://github.com/cohstats/coh3-stats-desktop-app/releases/latest"
              target="_blank"
            >
              Release Notes
            </Anchor>
          </Stack>
          <Title>Gain additional intel on your games with the desktop app!</Title>
          <List
            spacing="sm"
            mt={30}
            mb={50}
            icon={
              <ThemeIcon size={20} radius="xl">
                <IconCheck stroke={1.5} />
              </ThemeIcon>
            }
          >
            <List.Item>
              Effortless usage, no setup needed - simply launch the application
            </List.Item>
            <List.Item>Explore intricate player leaderboard statistics</List.Item>
            <List.Item>Receive optional sound notifications upon joining a game</List.Item>
            <List.Item>Auto upload replays to the cloud for additional analysis</List.Item>
            <List.Item>
              Streamer overlay for{" "}
              <Anchor href={"https://obsproject.com/"} target={"_blank"}>
                OBS
              </Anchor>
              ,{" "}
              <Anchor href={"https://www.twitch.tv/broadcast/studio"} target={"_blank"}>
                Twitch Studio
              </Anchor>{" "}
              and other streaming tools
            </List.Item>
          </List>
        </Paper>
      </Container>
    </>
  );
};

export default DesktopAppPage;
