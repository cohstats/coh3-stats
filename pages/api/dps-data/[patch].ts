import type { NextApiRequest, NextApiResponse } from "next";
import appConfig from "../../../config";
import {
  getDpsDataPackage,
  getDpsPackageBody,
} from "../../../src/unitStats/dpsDataPackage.server";

// The uncompressed fallback can exceed Next's default API response warning limit.
export const config = { api: { responseLimit: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const patch = typeof req.query.patch === "string" ? req.query.patch : "";
  const plainJson = patch.endsWith(".json");
  const version = plainJson ? patch.slice(0, -5) : patch;
  if (!Object.hasOwn(appConfig.patches, version)) {
    return res.status(404).json({ error: "Unknown patch" });
  }
  try {
    const body = getDpsPackageBody(await getDpsDataPackage(version), plainJson);
    // Clients include the page build ID in the URL, so new deployments get fresh mappings.
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400",
    );
    res.setHeader(
      "Content-Type",
      plainJson ? "application/json; charset=utf-8" : "application/gzip",
    );
    res.setHeader("Content-Length", body.length);
    if (req.method === "HEAD") return res.status(200).end();
    return res.status(200).send(body);
  } catch (error) {
    console.error("Failed to prepare DPS data:", error);
    return res.status(503).json({ error: "Unable to load DPS data" });
  }
}
