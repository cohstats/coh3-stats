import { useEffect, useState } from "react";
import { Container, Group, Text, Title, useMantineColorScheme } from "@mantine/core";
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

  useEffect(() => {
    // this gate only be needed because of react strict mode running things twice
    if (document.getElementById("twitch-script") !== null || twitchStreams === null) return;

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

  function handleChangeChannel(channel: string) {
    player.setChannel(channel);
    player.play();
  }

  return (
    <Container size="xl">
      <Title order={2} size="h4" pt="md">
        Watch Live Streams
      </Title>
      <Group>
        <div style={{ borderRadius: "0.5rem", overflow: "hidden" }} id="twitch-embed"></div>
        {twitchStreams && (
          <ChannelList onChangeChannel={handleChangeChannel} twitchStreams={twitchStreams} />
        )}
      </Group>
    </Container>
  );
};

export default TwitchPanel;
