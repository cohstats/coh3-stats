import { Box, Container, Flex, Grid, Title } from "@mantine/core";
import { IconBrandTwitch } from "@tabler/icons-react";
import { TwitchStream } from "../../../../src/coh3/coh3-types";
import dynamic from "next/dynamic";

// This needs to be client side only due to some weird errors during SSR
const TwitchPanel = dynamic(() => import("./twitch-panel"), {
  ssr: false,
});

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
};

const TwitchContainer = ({ twitchStreams, error }: Props) => {
  return (
    <Container size="fluid" px={"xs"} pb={5}>
      <Flex justify="flex-start" align="center" gap={5} pb="sm">
        <IconBrandTwitch size={40} />
        <Title order={2} size="h2">
          Watch Live Streams
        </Title>
      </Flex>

      <Grid grow>
        <Grid.Col md={9} sm={12}>
          <Box style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
            <div
              id="twitch-embed"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            ></div>
          </Box>
        </Grid.Col>

        <TwitchPanel twitchStreams={twitchStreams} error={error} />
      </Grid>
    </Container>
  );
};

export default TwitchContainer;
