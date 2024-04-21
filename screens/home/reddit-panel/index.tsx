import { Paper, Title, Image, Text, Flex, Anchor, Group, Stack, Divider } from "@mantine/core";
import { RedditPostType } from "../../../src/apis/reddit-api";
// The next image doesn't work with reddit source
// import Image from 'next/image'
import React from "react";
import { IconArrowUp } from "@tabler/icons-react";

const RedditPanel = ({ redditPostsData }: { redditPostsData: RedditPostType[] | null }) => {
  console.log("redditDAta", redditPostsData);

  const redditPosts = redditPostsData?.map((post) => {
    return (
      <>
        <Paper key={post.created} p={"xs"} mb={5}>
          <Flex>
            <Stack>
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
                      {" "}
                      -{" "}
                      <Anchor
                        href={`https://www.reddit.com/user/${post.author}/`}
                        target={"_blank"}
                        color={"dark0"}
                      >
                        u/{post.author}
                      </Anchor>{" "}
                      - {post.comments} comments - {post.created}
                    </Text>
                  </Group>
                </Text>
              </Flex>
            </Stack>
            {post.image && !post.image.includes("gallery") && (
              <Image maw={120} mx="auto" radius="xs" src={post.image || null} alt={post.title} />
            )}
          </Flex>
        </Paper>
        <Divider />
      </>
    );
  });

  // Implement reddit panel here
  return (
    <Paper withBorder shadow="xs" radius="md" mt="md" p="md" color="gray">
      <Title size="h3">
        Top COH3 Reddit posts
        {redditPosts}
      </Title>
    </Paper>
  );
};

export default RedditPanel;
