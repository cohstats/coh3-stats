/**
 * @jest-environment node
 */

import { getLatestCOH3RedditPosts } from "../../../src/apis/reddit-api";
import redditResponse from "../../test-assets/reddit-api-reponse.json";

describe("getLatestCOH3RedditPosts", () => {
  const setupFetchStub = (data: any) => () =>
    Promise.resolve({ json: () => Promise.resolve(data), ok: true });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(redditResponse));
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
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

  it("When type is link, should return the correct image", async () => {
    const posts = await getLatestCOH3RedditPosts(10);
    const linkPost = posts.find((post) => post.title === "Assault on the Hill");
    expect(linkPost?.image).toBe(
      "https://b.thumbs.redditmedia.com/PHoP0xgLR0G4eLWn8XzhfKqgBd49BNbMKVXp3cSBvHE.jpg",
    );
  });

  it("should test the content of the first post", async () => {
    const posts = await getLatestCOH3RedditPosts(10);
    const firstPost = posts[0];
    expect(firstPost.title).toBe("Assault on the Hill");
    expect(firstPost.upvotes).toBe(132);
    expect(firstPost.comments).toBe(38);
    expect(firstPost.author).toBe("Trialshock92");
    expect(firstPost.image).toBe(
      "https://b.thumbs.redditmedia.com/PHoP0xgLR0G4eLWn8XzhfKqgBd49BNbMKVXp3cSBvHE.jpg",
    );
    expect(firstPost.created).toBe(1691715898);
    expect(firstPost.permalink).toBe("/r/CompanyOfHeroes/comments/15nuafz/assault_on_the_hill/");
  });

  it("should handle fetch failure", async () => {
    // @ts-ignore
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error("Fetch failed")));
    const posts = await getLatestCOH3RedditPosts(10);
    expect(posts).toEqual([]);
  });

  it("should handle non-ok response", async () => {
    // @ts-ignore
    global.fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));
    const posts = await getLatestCOH3RedditPosts(10);
    expect(posts).toEqual([]);
  });

  it("should handle no posts in response data", async () => {
    // @ts-ignore
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve({ data: { children: [] } }), ok: true }),
    );
    const posts = await getLatestCOH3RedditPosts(10);
    expect(posts).toEqual([]);
  });

  it("should handle no 'CoH3' posts in response data", async () => {
    const nonCoH3Post = { data: { link_flair_text: "COH2" } };
    // @ts-ignore
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: { children: [nonCoH3Post] } }),
        ok: true,
      }),
    );
    const posts = await getLatestCOH3RedditPosts(10);
    expect(posts).toEqual([]);
  });

  it("should return only the requested number of posts when there are more posts in the response data", async () => {
    const CoH3Post = { data: { link_flair_text: "CoH3" } };
    const responseData = { data: { children: Array(20).fill(CoH3Post) } };
    // @ts-ignore
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(responseData), ok: true }),
    );
    const posts = await getLatestCOH3RedditPosts(10);
    expect(posts.length).toBe(10);
  });

  it("should return all posts when there are less posts in the response data than the requested number", async () => {
    const CoH3Post = { data: { link_flair_text: "CoH3" } };
    const responseData = { data: { children: Array(5).fill(CoH3Post) } };
    // @ts-ignore
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(responseData), ok: true }),
    );
    const posts = await getLatestCOH3RedditPosts(10);
    expect(posts.length).toBe(5);
  });
});
