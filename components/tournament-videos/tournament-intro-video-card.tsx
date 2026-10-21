import React from "react";
import { AspectRatio, Box, Card, Image } from "@mantine/core";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { getYoutubeVideoId } from "../../src/utils";
import classes from "./tournament-videos.module.css";

type TournamentIntroVideoCardProps = {
  // YouTube URL of the video
  url: string;
  // Accessible name of the card, there is no visible title - the thumbnail has the text already
  label: string;
};

/**
 * Thumbnail only card for a tournament intro video, links to YouTube.
 */
const TournamentIntroVideoCard: React.FC<TournamentIntroVideoCardProps> = ({ url, label }) => {
  const youtubeVideoId = getYoutubeVideoId(url);

  return (
    <Card
      padding={0}
      component="a"
      href={url}
      target="_blank"
      // we are OK with sending the referer header to youtube
      rel=""
      radius="md"
      withBorder
      className={classes.card}
      aria-label={label}
      title={label}
      data-testid="tournament-intro-video"
    >
      <Box className={classes.thumbnail}>
        <AspectRatio ratio={16 / 9}>
          {youtubeVideoId ? (
            <Image
              src={`https://i.ytimg.com/vi_webp/${youtubeVideoId}/hqdefault.webp`}
              alt={label}
            />
          ) : (
            <Box className={classes.placeholder} />
          )}
        </AspectRatio>
        <span className={classes.playOverlay}>
          <IconPlayerPlayFilled size={14} />
        </span>
      </Box>
    </Card>
  );
};

export default TournamentIntroVideoCard;
