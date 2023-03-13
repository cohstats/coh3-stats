import { useEffect } from "react";
import { Paper } from "@mantine/core";
import { TwitchStream } from "../../src/coh3/coh3-types";

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
  useEffect(() => {
    // this gate only be needed because of react strict mode running things twice
    if (document.getElementById("twitch-script") !== null || twitchStreams === null) return;

    console.log(twitchStreams);

    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.id = "twitch-script";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      console.log("hmm");
      const embed = new window.Twitch.Embed("twitch-embed", {
        width: 854,
        height: 480,
        channel: twitchStreams[0].user_login,
        layout: "video",
        autoplay: false,
        // Only needed if this page is going to be embedded on other websites
        parent: ["embed.example.com", "othersite.example.com"],
      });

      embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
        const player = embed.getPlayer();
        player.play();
      });
    });
  }, [twitchStreams]);
  return (
    <Paper shadow="xs" radius="md" mt="md" color="gray" style={{ width: "fit-content" }}>
      <div style={{ borderRadius: "0.5rem", overflow: "hidden" }} id="twitch-embed"></div>
    </Paper>
  );
};

export default TwitchPanel;
