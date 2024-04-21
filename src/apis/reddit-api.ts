import { logger } from "../logger";

interface RedditPostType {
  title: string;
  upvotes: number;
  comments: number;
  author: string;
  image: string;
  created: number;
  permalink: string;
}

const getLatestCOH3RedditPosts = async (numberOfPosts = 10): Promise<RedditPostType[]> => {
  try {
    // We need a heavy cache on this, reddit is throttling like crazy
    const response = await fetch(
      `https://cache.coh3stats.com/r/CompanyOfHeroes/top.json?limit=100&t=month`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      console.warn(`Error getting reddit posts: ${response.statusText}, ${response.status}`);
      return [];
    }

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
          comments: post.data.num_comments ?? null,
          author: post.data.author ?? null,
          created: post.data.created_utc ?? null,
          permalink: post.data.permalink ?? null,
          image:
            (() => {
              if (post.data.is_gallery && post.data.is_gallery == true) {
                return post.data.thumbnail ?? null;
              }

              if (post.data.is_video && post.data.is_video == true) {
                return null;
              }
              return post.data.url_overridden_by_dest ?? null;
            })() || null,
        };
      });
  } catch (e) {
    logger.error(e);
    return [];
  }
};

export type { RedditPostType };
export { getLatestCOH3RedditPosts };
