import handler from "../../../pages/api/getNodeVersion";
import { NextApiRequest, NextApiResponse } from "next";

describe("getNodeVersionHandler", () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    req = {} as unknown as NextApiRequest;

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

  test("should return 200 status code and node version", async () => {
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ nodeVersion: process.version });
  });
});
