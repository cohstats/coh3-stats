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
      `https://cache.coh3stats.com/r/CompanyOfHeroes/top.json?limit=100&t=week`,
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
      .map(({ data }: { data: any }) => {
        // we can't serialize undefined values

        return {
          title: data.title ?? null,
          upvotes: data.ups ?? null,
          comments: data.num_comments ?? null,
          author: data.author ?? null,
          created: data.created_utc ?? null,
          permalink: data.permalink ?? null,
          image:
            (() => {
              // This is gallery post on Reddit
              if (data.is_gallery && data.is_gallery == true) {
                return data.thumbnail ?? null;
              }

              // This is type of post link on Reddit
              if (data.post_hint === "link") {
                return data.thumbnail ?? null;
              }

              // This is when you link YouTube video
              if (data.post_hint === "rich:video") {
                return data.thumbnail ?? null;
              }

              // This is when you upload video to Reddit
              if (data.is_video && data.is_video == true) {
                return null;
              }

              return data.url_overridden_by_dest ?? null;
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
