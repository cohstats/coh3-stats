import { Paper, Title, Text, Flex, Anchor, Group, Stack, Divider } from "@mantine/core";
import { RedditPostType } from "../../../src/apis/reddit-api";

import React from "react";
import {IconArrowUp, IconBrandReddit} from "@tabler/icons-react";

import DynamicTimeAgo from "../../../components/other/dynamic-timeago";
import ImageWithModal from "../../../components/image-with-modal";

const RedditPanel = ({ redditPostsData }: { redditPostsData: RedditPostType[] | null }) => {
  const redditPosts = redditPostsData?.map((post, index) => {
    return (
      <>
        <Paper key={post.created} p={"xs"} pl={0} pr={0} mb={5}>
          <Flex justify={"space-between"} columnGap={"xs"}>
            <Stack spacing={"xs"}>
              <Flex>
                <Title order={5}>
                  <Anchor
                    href={`https://www.reddit.com${post.permalink}`}
                    target={"_blank"}
                    inherit={true}
                    color={"dark0"}
                  >
                    {post.title}
                  </Anchor>
                </Title>
              </Flex>
              <Flex>
                <Text size={"xs"}>
                  <Group spacing={4}>
                    <IconArrowUp size={"1rem"} /> {post.upvotes}{" "}
                    <Text c="dimmed">
                      <Group spacing={2}>
                      {" "}
                      -{" "}
                      <Anchor
                        href={`https://www.reddit.com/user/${post.author}/`}
                        target={"_blank"}
                        color={"dark0"}
                      >
                        u/{post.author}
                      </Anchor>{" "}
                      <span>- {post.comments} comments -</span>
                      <DynamicTimeAgo timestamp={post.created} />
                      </Group>
                    </Text>
                  </Group>
                </Text>
              </Flex>
            </Stack>
            {post.image && !post.image.includes("gallery") && (
              <ImageWithModal
                height={55}
                width={100}
                alt={post.title}
                src={post.image}
                modalW={800}
                modalH={600}
                title={post.title}
              />
            )}
          </Flex>
        </Paper>
        {index !== redditPostsData.length - 1 && <Divider />}
      </>
    );
  });

  // Implement reddit panel here
  return (
    <Paper withBorder shadow="xs" radius="md" mt="md" p="md" color="gray">
      <Flex gap="xs" justify="flex-start" align="center" direction="row" wrap="wrap">
        <IconBrandReddit /> <Title size="h3">Top COH3 Reddit posts
        </Title>
      </Flex>
      {redditPosts}
    </Paper>
  );
};

export default RedditPanel;
