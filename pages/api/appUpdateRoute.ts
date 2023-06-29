/**
 * This route is used be the desktop app to determine if the auto updater should update the app
 */

import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const octokit = new Octokit();
  const response = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
    owner: "cohstats",
    repo: "coh3-stats-desktop-app",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (response.status !== 200) {
    return res.status(500).json({
      message: "Request to github api failed",
    });
  }
  if (response.data.published_at === null) {
    return res.status(500).json({
      message: "Github response has no published at date",
    });
  }
  const date = new Date(response.data.published_at);
  let sigURL: string | undefined;
  let zipURL: string | undefined;
  response.data.assets.forEach((asset) => {
    if (asset.browser_download_url.split(".").at(-1) === "zip") {
      zipURL = asset.browser_download_url;
    }
    if (asset.browser_download_url.split(".").at(-1) === "sig") {
      sigURL = asset.browser_download_url;
    }
  });

  if (zipURL === undefined || sigURL === undefined) {
    return res.status(500).json({
      message: "Could not find required assets in latest release.",
    });
  }

  try {
    const fileResponse = await fetch(sigURL);
    const fileContent = await fileResponse.text();

    return res
      .setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=14400")
      .status(200)
      .json({
        version: "v" + response.data.tag_name,
        notes: response.data.body,
        pub_date: date.toISOString(),
        platforms: {
          "windows-x86_64": {
            signature: fileContent,
            url: zipURL,
          },
        },
      });
  } catch (error) {
    return res.status(500).json({
      message: "Could not retrieve contends of the signature file.",
    });
  }
}
