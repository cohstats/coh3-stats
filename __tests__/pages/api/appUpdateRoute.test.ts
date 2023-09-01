import handler from "../../../pages/api/appUpdateRoute";
import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";

//https://stackoverflow.com/questions/70566676/jest-mock-doesnt-work-inside-tests-only-outside-tests
jest.mock("octokit", () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        request: jest.fn().mockResolvedValue({
          status: 500,
          data: {
            published_at: "2022-11-28T00:00:00Z",
            tag_name: "1.0.0",
            body: "Release notes",
            assets: [
              {
                browser_download_url: "https://example.com/download.zip",
              },
              {
                browser_download_url: "https://example.com/download.sig",
              },
            ],
          },
        }),
      };
    }),
  };
});

describe("appUpdateRouteHandler", () => {
  let req: NextApiRequest;
  let res: NextApiResponse;
  let octokit: any;

  beforeAll(() => {
    req = {
      method: "GET",
    } as NextApiRequest;

    res = {
      setHeader: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    // jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should return 200 status code and latest release in response", async () => {
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=14400",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      version: "v1.0.0",
      notes: "Test release",
      pub_date: expect.any(String),
      platforms: {
        "windows-x86_64": {
          signature: "mocked file content",
          url: "https://example.com/download.zip",
        },
      },
    });
  });

  it("should return 500 status code when octokit request fails", async () => {
    // jest.spyOn(octokit, "request").mockImplementation(() => Promise.resolve({
    //   status: 500,
    // }));

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Request to github api failed",
    });
  });
});
