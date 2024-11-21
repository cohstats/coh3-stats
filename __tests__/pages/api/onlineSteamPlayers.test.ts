/**
 * @jest-environment node
 */

import handler from "../../../pages/api/onlineSteamPlayers";
import { NextApiRequest, NextApiResponse } from "next";

describe("onlineSteamApiPlayersHandler", () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  // Mock the fetch function
  const fakeData = { response: { player_count: 5 } };
  const setupFetchStub = (data: any) => () =>
    Promise.resolve({ json: () => Promise.resolve(data) });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeData));

    req = {
      method: "GET",
    } as NextApiRequest;

    res = {
      setHeader: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;

    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test("should return 200 status code and player count and timestamp in response", async () => {
    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Cache-Control",
      "public, max-age=300, s-maxage=180, stale-while-revalidate=1200",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      playerCount: 5,
      timeStampMs: expect.any(Number),
    });
  });

  test("should return 500 status code when fetch throws an error", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Fake error"));

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({});
  });
});
