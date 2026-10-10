import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { AspectRatio, Badge, Box, Card, Image, Stack, Text, Tooltip } from "@mantine/core";
import { IconBrandTwitch, IconPlayerPlayFilled } from "@tabler/icons-react";
import type { LadderTournamentCasterVideo } from "../../src/apis/ladder-tournament-api";
import { getYoutubeVideoId } from "../../src/utils";
import classes from "./tournament-videos.module.css";

type TournamentVideoCardProps = {
  video: LadderTournamentCasterVideo;
  index?: number;
};

const isFinalStage = (stage: string) => ["FINAL", "FINALS"].includes(stage.trim().toUpperCase());

/**
 * Formats the publish date, eg "7 Sep 2026".
 * Uses dayjs instead of toLocaleDateString, so the SSR and the client output are the same (no hydration mismatch).
 * The API date has no timezone, so it's parsed and formatted in the same (local) time zone.
 */
const formatPublishedAt = (publishedAt: string, locale: string) => {
  const date = dayjs(publishedAt);
  if (!date.isValid()) return "";
  return date.locale(locale).format("D MMM YYYY");
};

/**
 * Card for a single casted tournament video.
 * Links to YouTube, Twitch is used as a fallback.
 */
const TournamentVideoCard: React.FC<TournamentVideoCardProps> = ({ video, index = 0 }) => {
  const { locale = "en" } = useRouter();
  const youtubeVideoId = getYoutubeVideoId(video.videoUrlYoutube);
  const videoUrl = video.videoUrlYoutube || video.videoUrlTwitch;
  const date = formatPublishedAt(video.publishedAt, locale);

  return (
    <Card
      padding={0}
      component="a"
      href={videoUrl || undefined}
      target="_blank"
      // we are OK with sending the referer header to youtube / twitch
      rel=""
      radius="md"
      withBorder
      className={classes.card}
      data-testid={`tournament-video-${index}`}
    >
      <Card.Section className={classes.thumbnail}>
        <AspectRatio ratio={16 / 9}>
          {youtubeVideoId ? (
            <Image
              src={`https://i.ytimg.com/vi_webp/${youtubeVideoId}/hqdefault.webp`}
              alt={video.title}
              loading="lazy"
            />
          ) : (
            <Box className={classes.placeholder}>
              <IconBrandTwitch size={40} />
            </Box>
          )}
        </AspectRatio>
        <span className={classes.playOverlay}>
          <IconPlayerPlayFilled size={14} />
        </span>
        {video.stage && (
          // Filled, so it's readable on top of the thumbnail
          <Badge
            className={classes.stageBadge}
            color={isFinalStage(video.stage) ? "yellow" : "dark"}
            variant="filled"
            autoContrast
            size="xs"
            radius="sm"
          >
            {video.stage}
          </Badge>
        )}
      </Card.Section>
      <Stack gap={4} p="xs">
        <Tooltip.Floating label={video.title} multiline>
          <Text fw={600} size="sm" lineClamp={2} lh={1.3}>
            {video.title}
          </Text>
        </Tooltip.Floating>
        <Text c="dimmed" size="xs" lineClamp={1}>
          {video.castedBy}
          {date && ` · ${date}`}
        </Text>
      </Stack>
    </Card>
  );
};

export default TournamentVideoCard;
