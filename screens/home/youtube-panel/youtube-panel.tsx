import { YouTubeVideo } from "../../../src/coh3/coh3-types";
import React from "react";
import { AspectRatio, Card, Flex, Image, Paper, Text, Title, Tooltip } from "@mantine/core";
import { IconBrandYoutube } from "@tabler/icons-react";
import classes from "./youtube-panel.module.css";

type YoutubePanelProps = {
  youtubeData: YouTubeVideo[] | null;
};

const getYoutubeThumbnailUrl = (video: YouTubeVideo) => {
  return `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
};

const formatViewCount = (views: string): string => {
  const parsedViews = parseInt(views);
  if (parsedViews >= 1000) {
    return (parsedViews / 1000).toFixed(1) + "k";
  }
  return parsedViews.toString();
};

const YoutubePanel: React.FC<YoutubePanelProps> = ({ youtubeData }) => {
  const youtubeVideos = youtubeData?.map((video, index) => (
    <Card
      shadow="sm"
      padding="xs"
      component="a"
      href={`https://www.youtube.com/watch?v=${video.videoId}`}
      target="_blank"
      // we are OK with sending the referer header to youtube
      rel=""
      key={index}
      m={{ base: 5, md: "sm" }}
      className={classes.card}
      radius={"md"}
      withBorder={true}
    >
      <Card.Section pb={4}>
        <AspectRatio ratio={16 / 9}>
          <Image src={getYoutubeThumbnailUrl(video)} h={"auto"} alt={video.title} />
        </AspectRatio>
      </Card.Section>
      <Tooltip.Floating label={video.title} multiline>
        <Title order={5} lineClamp={2}>
          {video.title}
        </Title>
      </Tooltip.Floating>
      <Text mt="xs" c="dimmed" size="sm" style={{ marginTop: 0 }}>
        {video.channelTitle} - {formatViewCount(video.viewCount)} views
      </Text>
    </Card>
  ));

  return (
    <Paper mt="0" pt="md" pb="md" color="gray">
      <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap" pb={5}>
        <IconBrandYoutube size={35} /> <Title size="h2">Last week's videos</Title>
      </Flex>
      <Flex wrap="wrap" justify="center">
        {youtubeVideos}
      </Flex>
    </Paper>
  );
};

export default YoutubePanel;
