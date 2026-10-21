import React from "react";
import { Box, Group, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import type { LadderStageGroup } from "../../../src/tournaments/ladder-tournament";
import TournamentVideoCard from "../../../components/tournament-videos/tournament-video-card";
import classes from "./ladder-tournament.module.css";

/**
 * One horizontal row of the cast cards per stage, the stages are already in the display order.
 */
const CastsByStage = ({ stages }: { stages: LadderStageGroup[] }) => {
  const { t } = useTranslation("tournaments");
  // Unique test ids across all the stages
  let videoIndex = 0;

  return (
    <Stack gap="lg">
      {stages.map((group) => (
        <Stack gap="xs" key={group.stage || "other"} data-testid="ladder-cast-stage">
          <Group gap="xs" align="baseline">
            <Title order={3} size="h5" tt="uppercase">
              {group.stage || t("league.casts.otherStage")}
            </Title>
            <Text size="sm" c="dimmed">
              {group.videos.length}
            </Text>
          </Group>
          <ScrollArea type="auto" offsetScrollbars scrollbarSize={8}>
            <Group gap="sm" wrap="nowrap" align="stretch">
              {group.videos.map((video, index) => (
                <Box
                  className={classes.castCard}
                  key={video.id ?? `${video.videoUrlYoutube || video.videoUrlTwitch}-${index}`}
                >
                  <TournamentVideoCard video={video} index={videoIndex++} />
                </Box>
              ))}
            </Group>
          </ScrollArea>
        </Stack>
      ))}
    </Stack>
  );
};

export default CastsByStage;
