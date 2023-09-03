/**
 * @jest-environment node
 */

import handler from "../../../pages/api/playerExport";
import { NextApiRequest, NextApiResponse } from "next";

describe("playerExportAPIHandler", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if profileIDs param is missing", async () => {
    const req = {
      query: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "profile id param is missing" });
  });

  test("should return 400 if profileIDs contains invalid params", async () => {
    const req = {
      query: {
        profileIDs: [1, 2, 3],
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "profile id contains invalid params" });
  });

  test("should return 500 if too many records requested", async () => {
    const req = {
      query: {
        profileIDs: JSON.stringify(Array(101).fill(1)),
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Too many records requested" });
  });

  test("should return 500 if an error occurred", async () => {
    const req = {
      query: {
        profileIDs: JSON.stringify(["1", "2"]),
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Mock implementation of the fetch function
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("Failed to fetch"));

    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "error processing the request" });
    // Restore the original fetch function
    // @ts-ignore
    global.fetch.mockClear();
  });
});
