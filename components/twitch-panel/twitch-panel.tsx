import { useEffect } from "react";
import { Paper } from "@mantine/core";

declare global {
  interface Window {
    Twitch: any;
  }
}

const TwitchPanel = () => {
  useEffect(() => {
    // this gate only be needed because of react strict mode running things twice
    if (document.getElementById("twitch-script") !== null) return;

    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.id = "twitch-script";
    document.body.appendChild(script);

    script.addEventListener("load", () => {
      const embed = new window.Twitch.Embed("twitch-embed", {
        width: 854,
        height: 480,
        channel: "monstercat",
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
  }, []);
  return (
    <Paper shadow="xs" radius="md" mt="md" p="lg" color="gray">
      <div id="twitch-embed"></div>
    </Paper>
  );
};

export default TwitchPanel;
