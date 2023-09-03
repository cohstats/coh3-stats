import handler from "../../../pages/api/appUpdateRoute";
import { NextApiRequest, NextApiResponse } from "next";

let mockRequest = jest.fn();

//https://stackoverflow.com/questions/70566676/jest-mock-doesnt-work-inside-tests-only-outside-tests
jest.mock("octokit", () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        request: mockRequest,
      };
    }),
  };
});

describe("appUpdateRouteHandler", () => {
  let req: NextApiRequest;
  let res: NextApiResponse;
  let octokit: any;

  const setupFetchStub = (data: any) => () =>
    Promise.resolve({ text: () => Promise.resolve(data) });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub("mocked signiture content"));

    req = {
      method: "GET",
    } as NextApiRequest;

    res = {
      setHeader: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test("should return 200 status code and latest release in", async () => {
    mockRequest.mockResolvedValue({
      status: 200,
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
      await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=14400",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      version: "v1.0.0",
      notes: "Release notes",
      pub_date: expect.any(String),
      platforms: {
        "windows-x86_64": {
          signature: "mocked signiture content",
          url: "https://example.com/download.zip",
        },
      },
    });
  });

  test("should return 500 status code when published_at is null", async () => {
    mockRequest.mockResolvedValue({
      status: 200,
      data: {
        published_at: null,
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
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Github response has no published at date",
    });
  });

  test("should return 500 status code when required assets are not found", async () => {
    mockRequest.mockResolvedValue({
      status: 200,
      data: {
        published_at: "2022-11-28T00:00:00Z",
        tag_name: "1.0.0",
        body: "Release notes",
        assets: [],
      },
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Could not find required assets in latest release.",
    });
  });

  test("should return 500 status code when signature file cannot be retrieved", async () => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(() => Promise.reject(new Error()));

    mockRequest.mockResolvedValue({
      status: 200,
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
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Could not retrieve contends of the signature file.",
    });
  });

  test("should return 500 status code when request to github api fails", async () => {
    mockRequest.mockResolvedValue({
      status: 500,
      data: {},
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Request to github api failed",
    });
  });
});
