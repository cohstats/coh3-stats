import {
  Anchor,
  Button,
  Container,
  Image,
  List,
  Paper,
  rem,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { GetServerSideProps, NextPage } from "next";
import { Octokit } from "octokit";
import Head from "next/head";
import React, { useEffect } from "react";
import { AnalyticsDesktopAppPageView } from "../src/firebase/analytics";

const App: NextPage = ({ downloadURL, downloadCount, version }: any) => {
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
        <meta property="og:image" content="/desktop-app/desktop-app-main-500x281.webp" />
      </Head>
      <Container size={"lg"}>
        {/*We need to fix this on both mobile and desktop to avoid CLS*/}
        <Image
          src="/desktop-app/desktop-app-main.webp"
          alt={"coh3 stats desktop app"}
          radius="md"
          mx="auto"
          maw={900}
          mih={190}
          mah={500}
        />
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
                <IconCheck size={rem(12)} stroke={1.5} />
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

export const getServerSideProps: GetServerSideProps<any> = async () => {
  const octokit = new Octokit();
  const response = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
    owner: "cohstats",
    repo: "coh3-stats-desktop-app",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  let downloadURL = "https://github.com/cohstats/coh3-stats-desktop-app/releases/latest"; // fallback in case request fails
  let downloadCount = 0;
  let version = "";
  if (response.status === 200) {
    const assets = response.data.assets.filter((asset: { browser_download_url: string }) => {
      if (asset.browser_download_url.split(".").at(-1) === "sig") {
        return false;
      } else if (asset.browser_download_url.includes("full")) {
        return false;
      }

      return true;
    });
    if (assets.length > 0) {
      downloadCount = assets
        .map((asset: { download_count: any }) => asset.download_count)
        .reduce((a: any, b: any) => a + b);
    }

    version = "v" + response.data.tag_name;
    const msiAsset = response.data.assets.find(
      (asset: { browser_download_url: string }) =>
        asset.browser_download_url.split(".").at(-1) === "msi",
    );
    if (msiAsset) {
      downloadURL = msiAsset.browser_download_url;
    }
  }

  return {
    props: { downloadURL, downloadCount, version },
  };
};

export default App;
