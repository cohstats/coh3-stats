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
import { IconCheck } from "@tabler/icons";
import { GetServerSideProps, NextPage } from "next";
import { Octokit } from "octokit";

const App: NextPage = ({ downloadURL, downloadCount, version }: any) => {
  return (
    <Container fluid>
      <Image src="/statsapp.png" alt={"coh3 stats desktop app"} radius="md" mx="auto" maw={900} />
      <Paper radius="md" mt="md" p="lg">
        <Stack align="center" spacing={5} mb={30}>
          <Anchor href={downloadURL} target="_blank">
            <Button>Download {version}</Button>
          </Anchor>
          <Text size="sm" color="dimmed">
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
          <List.Item>Easy to use, no configuration required - just start the app</List.Item>
          <List.Item>See detailed leaderboard stats of players in your game</List.Item>
          <List.Item>Get notified via sound when joining a game (optional)</List.Item>
          <List.Item>OBS Overlay feature</List.Item>
        </List>
      </Paper>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps<any> = async ({ params, query, res }) => {
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
    downloadCount = response.data.assets
      .filter((asset) => asset.browser_download_url.split(".").at(-1) !== "sig")
      .map((asset) => asset.download_count)
      .reduce((a, b) => a + b);
    version = "v" + response.data.tag_name;
    const msiAsset = response.data.assets.find(
      (asset) => asset.browser_download_url.split(".").at(-1) === "msi",
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
