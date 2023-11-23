/**
 * @jest-environment node
 */

import { getLatestCOH3RedditPosts } from "../../src/apis/reddit-api";
import redditResponse from "../test-assets/reddit-api-reponse.json";

describe("getLatestCOH3RedditPosts", () => {
  const setupFetchStub = (data: any) => () =>
    Promise.resolve({ json: () => Promise.resolve(data), ok: true });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(redditResponse));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should return 10 posts", async () => {
    const posts = await getLatestCOH3RedditPosts(10);
    expect(posts.length).toBe(10);
  });

  it("should return the correct number of posts when a different number is requested", async () => {
    const posts = await getLatestCOH3RedditPosts(5);
    expect(posts.length).toBe(5);
  });

  it("should return posts with correct properties", async () => {
    const posts = await getLatestCOH3RedditPosts(10);
    posts.forEach((post) => {
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("upvotes");
      expect(post).toHaveProperty("author");
      expect(post).toHaveProperty("image");
      expect(post).toHaveProperty("created");
      expect(post).toHaveProperty("permalink");
    });

    posts.forEach((post) => {
      expect(typeof post.title).toBe("string");
      expect(typeof post.author).toBe("string");
      expect(typeof post.upvotes).toBe("number");
    });
  });

  it("Order is by the most upvoted", async () => {
    const posts = await getLatestCOH3RedditPosts(10);

    // Check if the posts are sorted in descending order by upvotes
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].upvotes).toBeGreaterThanOrEqual(posts[i + 1].upvotes);
    }
  });

  it("should test the content of the first post", async () => {
    const posts = await getLatestCOH3RedditPosts(10);
    const firstPost = posts[0];
    expect(firstPost.title).toBe("Assault on the Hill");
    expect(firstPost.upvotes).toBe(132);
    expect(firstPost.author).toBe("Trialshock92");
    expect(firstPost.image).toBe("https://www.reddit.com/gallery/15nuafz");
    expect(firstPost.created).toBe(1691715898);
    expect(firstPost.permalink).toBe("/r/CompanyOfHeroes/comments/15nuafz/assault_on_the_hill/");
  });
});
