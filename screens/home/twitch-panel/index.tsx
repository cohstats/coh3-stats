import { Box, Center, Container, Flex, Grid, Title, Text } from "@mantine/core";
import { IconBrandTwitch } from "@tabler/icons-react";
import { TwitchStream } from "../../../src/coh3/coh3-types";
import dynamic from "next/dynamic";
import { TFunction } from "next-i18next";

// This needs to be client side only due to some weird errors during SSR
const TwitchPanel = dynamic(() => import("./twitch-panel"), {
  ssr: false,
});

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
  t: TFunction;
};

const TwitchContainer = ({ twitchStreams, error, t }: Props) => {
  const renderPanel = () => {
    if (!twitchStreams || twitchStreams.length === 0) {
      return (
        <Grid.Col span={{ base: 12 }} style={{ height: "100%" }}>
          <Box
            style={{
              position: "relative",
              width: "100%",
              paddingTop: "28.1%",
              paddingBottom: "28.1%",
            }}
          >
            <Center>
              <Text>{t("sections.twitch.noStreams")}</Text>
            </Center>
          </Box>
        </Grid.Col>
      );
    } else {
      return (
        <Grid.Col span={{ md: 9, sm: 12 }}>
          {/*This is trick to have 16:9 aspect ratio but have 0 CLS*/}
          <Box style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
            <div
              id="twitch-embed"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            ></div>
          </Box>
        </Grid.Col>
      );
    }
  };

  return (
    <Container size="fluid" pb={5} pr={{ base: 1, xs: "md" }} pl={{ base: 1, xs: "md" }}>
      <Flex justify="flex-start" align="center" gap={5} pb="sm">
        <IconBrandTwitch size={35} />
        <Title order={2} size="h2">
          {t("sections.twitch.title")}
        </Title>
      </Flex>

      <Grid grow>
        {renderPanel()}
        <TwitchPanel twitchStreams={twitchStreams} error={error} />
      </Grid>
    </Container>
  );
};

export default TwitchContainer;
