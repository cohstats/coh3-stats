/** @jest-environment node */

import { promises as fs } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import type { NextApiRequest, NextApiResponse } from "next";
import appConfig from "../../../config";
import handler from "../../../pages/api/dps-data/[patch]";
import { getDpsData } from "../../../src/unitStats/dpsData.server";
import { prepareDpsDataPackage } from "../../../src/unitStats/dpsDataPackage.server";
import { EMPTY_DPS_DATA } from "../../../src/unitStats/dpsData";

jest.mock("node:fs", () => ({
  promises: {
    readFile: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    rename: jest.fn(),
  },
}));
jest.mock("../../../src/unitStats/dpsData.server", () => ({ getDpsData: jest.fn() }));

const load = jest.mocked(getDpsData);
const oldPatches = Object.keys(appConfig.patches).filter(
  (patch) => patch !== appConfig.latestPatch,
);
const response = () => {
  const headers: Record<string, unknown> = {};
  const res = {
    statusCode: 200,
    headers,
    body: undefined as unknown,
    setHeader: jest.fn(),
    status: jest.fn(),
    send: jest.fn(),
    json: jest.fn(),
    end: jest.fn(),
  };
  res.setHeader.mockImplementation((name: string, value: unknown) => {
    headers[name] = value;
    return res;
  });
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.send.mockImplementation((body: unknown) => {
    res.body = body;
    return res;
  });
  res.json.mockImplementation((body: unknown) => {
    res.body = body;
    return res;
  });
  return res;
};
const call = async (patch: string, method = "GET") => {
  const res = response();
  await handler(
    { query: { patch }, method } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  load.mockResolvedValue(EMPTY_DPS_DATA);
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

it("shares mapping and compression between gzip, JSON, and HEAD responses", async () => {
  const patch = oldPatches[0];
  const data = { ...EMPTY_DPS_DATA, patch };
  load.mockResolvedValue(data);
  const [gzip, plain] = await Promise.all([call(patch), call(`${patch}.json`)]);
  expect(load).toHaveBeenCalledTimes(1);
  expect(load).toHaveBeenCalledWith(patch);
  expect(gzip.statusCode).toBe(200);
  expect(gzip.headers["Content-Type"]).toBe("application/gzip");
  expect(JSON.parse(gunzipSync(gzip.body as Buffer).toString())).toEqual(data);
  expect(JSON.parse((plain.body as Buffer).toString())).toEqual(data);
  expect(plain.headers["Content-Type"]).toMatch(/application\/json/);
  expect(gzip.headers["Cache-Control"]).toContain("s-maxage=31536000");
  const head = await call(patch, "HEAD");
  expect(head.statusCode).toBe(200);
  expect(head.headers["Content-Length"]).toBe((gzip.body as Buffer).length);
  expect(head.end).toHaveBeenCalled();
  expect(head.send).not.toHaveBeenCalled();
  expect(load).toHaveBeenCalledTimes(1);
});

it("serves the prebuilt current patch without mapping it on the first production request", async () => {
  const original = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: "production" });
  const body = gzipSync(JSON.stringify(EMPTY_DPS_DATA));
  jest.mocked(fs.readFile).mockResolvedValue(body);
  try {
    const gzip = await call(appConfig.latestPatch);
    const plain = await call(`${appConfig.latestPatch}.json`);
    expect(gzip.body).toBe(body);
    expect(JSON.parse((plain.body as Buffer).toString())).toEqual(EMPTY_DPS_DATA);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(load).not.toHaveBeenCalled();
  } finally {
    Object.assign(process.env, { NODE_ENV: original });
  }
});

it("does not cache a transient preparation failure and can retry", async () => {
  const patch = oldPatches[1];
  load.mockRejectedValueOnce(new Error("Temporary download failure"));
  const failed = await call(patch);
  expect(failed.statusCode).toBe(503);
  expect(failed.headers["Cache-Control"]).toBe("no-store");
  const recovered = await call(patch);
  expect(recovered.statusCode).toBe(200);
  expect(load).toHaveBeenCalledTimes(2);
});

it("rejects unknown patches and unsupported methods without preparing data", async () => {
  const missing = await call("not-a-patch");
  expect(missing.statusCode).toBe(404);
  expect(missing.body).toEqual({ error: "Unknown patch" });
  expect(missing.headers["Cache-Control"]).toBe("no-store");
  const method = await call(appConfig.latestPatch, "POST");
  expect(method.statusCode).toBe(405);
  expect(method.headers.Allow).toBe("GET, HEAD");
  expect(load).not.toHaveBeenCalled();
});

it("prepares a fresh compressed package atomically during prebuild", async () => {
  await prepareDpsDataPackage();
  expect(load).toHaveBeenCalledWith(appConfig.latestPatch);
  const [temporary, body] = jest.mocked(fs.writeFile).mock.calls[0];
  expect(String(temporary)).toContain(`${appConfig.latestPatch}.json.gz.`);
  expect(JSON.parse(gunzipSync(body as Buffer).toString())).toEqual(EMPTY_DPS_DATA);
  expect(fs.rename).toHaveBeenCalledWith(
    temporary,
    expect.stringContaining(`${appConfig.latestPatch}.json.gz`),
  );
});
