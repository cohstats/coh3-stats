import { useEffect, useMemo, useState } from "react";
import { Container, Flex, Group, Text, Title, useMantineColorScheme } from "@mantine/core";
import { IconBrandTwitch, IconCircle } from "@tabler/icons";
import { TwitchStream } from "../../src/coh3/coh3-types";
import ChannelList from "./channel-list";

declare global {
  interface Window {
    Twitch: any;
  }
}

type Props = {
  twitchStreams: TwitchStream[] | null;
  error: Error | null;
};
const TwitchPanel = ({ twitchStreams, error }: Props) => {
  const { colorScheme } = useMantineColorScheme();
  const [player, setPlayer] = useState<any>();
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);

  const currentStream = useMemo(() => {
    return twitchStreams && twitchStreams[currentChannelIndex];
  }, [twitchStreams, currentChannelIndex]);

  useEffect(() => {
    // this gate only be needed because of react strict mode running things twice
    if (document.getElementById("twitch-script") !== null || twitchStreams === null) return;
    console.log(twitchStreams);

    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.id = "twitch-script";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      const embed = new window.Twitch.Embed("twitch-embed", {
        width: 854,
        height: 480,
        channel: twitchStreams[0].user_login,
        layout: "video",
        autoplay: false,
        theme: colorScheme,
        // Only needed if this page is going to be embedded on other websites
        parent: ["embed.example.com", "othersite.example.com"],
      });

      embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
        const player = embed.getPlayer();
        player.play();
        setPlayer(player);
      });
    });
  }, [twitchStreams, colorScheme]);

  function handleChangeChannel(channelIndex: number) {
    if (!twitchStreams) return;
    setCurrentChannelIndex(channelIndex);
    player.setChannel(twitchStreams[channelIndex].user_login);
    player.play();
  }

  return (
    <Container size="fluid">
      <Flex justify="flex-start" align="center" gap={10} pb="sm">
        <IconBrandTwitch size={40} />
        <Title order={2} size="h2">
          Watch Live Streams
        </Title>
      </Flex>

      <Group>
        <Container>
          <div id="twitch-embed"></div>
        </Container>

        {twitchStreams && (
          <ChannelList onChangeChannel={handleChangeChannel} twitchStreams={twitchStreams} />
        )}
      </Group>
      <Container>
        {currentStream && (
          <>
            <Group>
              <IconCircle fill="red" color="red" size={10} />
              <Text fw={700}>{currentStream.user_name}</Text>
              <Text>{currentStream.viewer_count} viewers</Text>
            </Group>
            <Text>{currentStream.title}</Text>
          </>
        )}
      </Container>
    </Container>
  );
};

export default TwitchPanel;
