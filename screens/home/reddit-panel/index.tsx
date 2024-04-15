import { Paper, Title } from "@mantine/core";
import { RedditPostType } from "../../../src/apis/reddit-api";

const RedditPanel = ({ redditPostsData }: { redditPostsData: RedditPostType[] | null }) => {
  console.log("redditDAta", redditPostsData);

  // Implement reddit panel here
  return (
    <Paper withBorder shadow="xs" radius="md" mt="md" p="md" color="gray">
      <Title order={1} size="h2">
        Top COH3 Reddit posts
      </Title>
    </Paper>
  );
};

export default RedditPanel;
