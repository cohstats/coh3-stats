import React from "react";
import { Flex, Paper, Text, Title } from "@mantine/core";
import { IconBrandYoutube } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type { LadderTournamentCasterVideo } from "../../src/apis/ladder-tournament-api";
import TournamentVideoCard from "./tournament-video-card";

type TournamentVideosPanelProps = {
  // null when the videos couldn't be loaded
  videos: LadderTournamentCasterVideo[] | null;
  title?: string;
  emptyText?: string;
};

/**
 * Panel with casted tournament videos.
 */
const TournamentVideosPanel: React.FC<TournamentVideosPanelProps> = ({
  videos,
  title,
  emptyText,
}) => {
  const { t } = useTranslation("common");

  let content: React.ReactNode;
  if (videos === null) {
    content = <Text c="dimmed">{t("tournamentVideos.unavailable")}</Text>;
  } else if (videos.length === 0) {
    content = <Text c="dimmed">{emptyText || t("tournamentVideos.noVideos")}</Text>;
  } else {
    content = (
      <Flex wrap="wrap" justify="flex-start">
        {videos.map((video, index) => (
          <TournamentVideoCard
            video={video}
            index={index}
            key={`${video.videoUrlYoutube || video.videoUrlTwitch}-${index}`}
          />
        ))}
      </Flex>
    );
  }

  return (
    <Paper pt="md" pb="md" data-testid="tournament-videos-panel">
      <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap" pb={5}>
        <IconBrandYoutube size={35} />
        <Title order={2} size="h2">
          {title || t("tournamentVideos.title")}
        </Title>
      </Flex>
      {content}
    </Paper>
  );
};

export default TournamentVideosPanel;
