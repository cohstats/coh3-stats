import { Paper, Title, Flex, Anchor, Group, Stack, Divider } from "@mantine/core";
import { RedditPostType } from "../../../src/apis/reddit-api";
import React from "react";
import { IconArrowUp, IconBrandReddit } from "@tabler/icons-react";
import DynamicTimeAgo from "../../../components/other/dynamic-timeago";
import ImageWithModal from "../../../components/image-with-modal";
import classes from "./reddit.module.css";
import { TFunction } from "next-i18next";

interface RedditPanelProps {
  redditPostsData: RedditPostType[] | null;
  t: TFunction;
}

const RedditPanel = ({ redditPostsData, t }: RedditPanelProps) => {
  const redditPosts = redditPostsData?.map((post, index) => {
    return (
      <div key={index}>
        <div
          key={post.created}
          style={{ padding: 8, paddingLeft: 0, paddingRight: 0, marginBottom: 5 }}
          data-testid={`reddit-post-${index}`}
        >
          <Flex justify={"space-between"} columnGap={"xs"}>
            <Stack gap={"xs"}>
              <Flex>
                <Title order={5}>
                  <Anchor
                    href={`https://www.reddit.com${post.permalink}`}
                    target={"_blank"}
                    inherit={true}
                    className={classes.redditLink}
                  >
                    {post.title}
                  </Anchor>
                </Title>
              </Flex>
              <Flex className={classes.redditInfo}>
                <Group gap={4}>
                  <IconArrowUp size={"1rem"} /> {post.upvotes} {/*<Text c="dimmed" inherit>*/}
                  <Group gap={2} className={classes.dimmedInfo}>
                    {" "}
                    -{" "}
                    <Anchor
                      href={`https://www.reddit.com/user/${post.author}/`}
                      target={"_blank"}
                      c={"dimmed"}
                      inherit
                    >
                      u/{post.author}
                    </Anchor>{" "}
                    <span>- {post.comments} comments -</span>
                    <DynamicTimeAgo timestamp={post.created} />
                  </Group>
                  {/*</Text>*/}
                </Group>
              </Flex>
            </Stack>
            {post.image && !post.image.includes("gallery") && (
              <ImageWithModal
                height={55}
                width={100}
                alt={post.title}
                src={post.image}
                title={post.title}
              />
            )}
          </Flex>
        </div>
        {index !== redditPostsData.length - 1 && <Divider />}
      </div>
    );
  });

  return (
    <Paper withBorder shadow="xs" radius="md" p={{ base: "xs", sm: "md" }} color="gray" data-testid="reddit-panel">
      <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap">
        <IconBrandReddit /> <Title size="h3">{t("sections.reddit.title")}</Title>
      </Flex>
      {redditPosts}
    </Paper>
  );
};

export default RedditPanel;
