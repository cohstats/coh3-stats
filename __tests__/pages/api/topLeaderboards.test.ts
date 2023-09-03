import handler from "../../../pages/api/topLeaderboards";
import { NextApiRequest, NextApiResponse } from "next";
import { getTop1v1LeaderBoards } from "../../../src/leaderboards/top-leaderboards";

let mockImplementation: Promise<any>;

jest.mock("../../../src/leaderboards/top-leaderboards", () => ({
  getTop1v1LeaderBoards: jest.fn().mockImplementation(() => mockImplementation),
}));

describe("topLeaderboardsHandler", () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    req = {
      query: {
        race: "american",
      },
    } as unknown as NextApiRequest;

    res = {
      setHeader: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 status code and leaderboard data", async () => {
    mockImplementation = Promise.resolve("test data");
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith("test data");
  });

  test("should return 500 status code on error", async () => {
    mockImplementation = Promise.reject(new Error("An error occurred"));
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({});
  });
});
