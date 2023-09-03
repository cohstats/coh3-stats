interface RedditPostType {
  title: string;
  upvotes: number;
  author: string;
  image: string;
  created: number;
  permalink: string;
}

const getLatestCOH3RedditPosts = async (numberOfPosts = 10): Promise<RedditPostType[]> => {
  const response = await fetch(
    `https://www.reddit.com/r/CompanyOfHeroes/top.json?limit=100&t=month`,
  );
  const data = await response.json();

  return data.data.children
    .filter((post: any) => {
      return `${post.data.link_flair_text}`.includes("CoH3");
    })
    .slice(0, numberOfPosts)
    .map((post: any) => {
      // we can't serialize undefined values
      return {
        title: post.data.title ?? null,
        upvotes: post.data.ups ?? null,
        author: post.data.author ?? null,
        image: post.data.url_overridden_by_dest ?? null,
        created: post.data.created_utc ?? null,
        permalink: post.data.permalink ?? null,
      };
    });
};

export type { RedditPostType };
export { getLatestCOH3RedditPosts };
