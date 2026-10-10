import React from "react";
import dayjs from "dayjs";
import { AspectRatio, Badge, Box, Card, Group, Image, Text, Title, Tooltip } from "@mantine/core";
import { IconBrandTwitch } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type { LadderTournamentCasterVideo } from "../../src/apis/ladder-tournament-api";
import { getYoutubeVideoId } from "../../src/utils";
import classes from "./tournament-videos.module.css";

type TournamentVideoCardProps = {
  video: LadderTournamentCasterVideo;
  index?: number;
};

const getStageBadgeColor = (stage: string) => {
  const normalizedStage = stage.trim().toUpperCase();
  if (normalizedStage === "FINAL" || normalizedStage === "FINALS") return "yellow";
  if (normalizedStage.includes("SEMI")) return "orange";
  if (normalizedStage.includes("THIRD")) return "grape";
  return "gray";
};

/**
 * Card for a single casted tournament video.
 * YouTube videos are preferred, Twitch is used as a fallback.
 */
const TournamentVideoCard: React.FC<TournamentVideoCardProps> = ({ video, index = 0 }) => {
  const { t } = useTranslation("common");

  const youtubeVideoId = getYoutubeVideoId(video.videoUrlYoutube);
  const videoUrl = video.videoUrlYoutube || video.videoUrlTwitch;
  const publishedAt = dayjs(video.publishedAt);

  return (
    <Card
      shadow="sm"
      padding="xs"
      component="a"
      href={videoUrl || undefined}
      target="_blank"
      // we are OK with sending the referer header to youtube / twitch
      rel=""
      m={{ base: 5, md: "sm" }}
      className={classes.card}
      radius={"md"}
      withBorder={true}
      data-testid={`tournament-video-${index}`}
    >
      <Card.Section pb={4} className={classes.thumbnail}>
        {video.stage && (
          <Badge
            className={classes.stageBadge}
            color={getStageBadgeColor(video.stage)}
            variant="filled"
            size="sm"
          >
            {video.stage}
          </Badge>
        )}
        <AspectRatio ratio={16 / 9}>
          {youtubeVideoId ? (
            <Image
              src={`https://i.ytimg.com/vi_webp/${youtubeVideoId}/hqdefault.webp`}
              h={"auto"}
              alt={video.title}
              loading="lazy"
            />
          ) : (
            <Box className={classes.placeholder}>
              <IconBrandTwitch size={48} />
            </Box>
          )}
        </AspectRatio>
      </Card.Section>
      <Tooltip.Floating label={video.title} multiline>
        <Title order={5} lineClamp={2}>
          {video.title}
        </Title>
      </Tooltip.Floating>
      <Text c="dimmed" size="sm">
        {t("tournamentVideos.castedBy", { caster: video.castedBy })}
      </Text>
      <Group justify="space-between" gap={4}>
        <Text c="dimmed" size="xs">
          {publishedAt.isValid() ? publishedAt.locale("en").format("MMM D, YYYY") : ""}
        </Text>
        <Text c="dimmed" size="xs">
          {t("tournamentVideos.season", { season: video.seasonId })}
        </Text>
      </Group>
    </Card>
  );
};

export default TournamentVideoCard;
