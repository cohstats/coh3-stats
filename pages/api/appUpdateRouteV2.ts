/**
 * This route is used be the desktop app to determine if the auto updater should update the app
 */

import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";
import { compareVersions } from "../../src/utils";

interface GitHubReleaseAsset {
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  body: string | null;
  assets: GitHubReleaseAsset[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`SSR - /api/appUpdateRouteV2`);

  const octokit = new Octokit();
  const response = await octokit.request("GET /repos/{owner}/{repo}/releases", {
    owner: "cohstats",
    repo: "coh3-stats-desktop-app",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
    per_page: 100,
  });

  if (response.status !== 200) {
    return res.status(500).json({
      message: "Request to github api failed",
    });
  }

  // Filter releases to only include version 2.0.0 and higher
  const validReleases = (response.data as GitHubRelease[]).filter((release) => {
    return !release.draft && !release.prerelease && compareVersions(release.tag_name, "2.0.0");
  });

  if (validReleases.length === 0) {
    return res.status(404).json({
      message: "No releases found with version 2.0.0 or higher",
    });
  }

  // Get the latest valid release (first one in the filtered list)
  const latestRelease = validReleases[0];

  if (latestRelease.published_at === null) {
    return res.status(500).json({
      message: "Github response has no published at date",
    });
  }
  const date = new Date(latestRelease.published_at);
  let sigURL: string | undefined;
  let zipURL: string | undefined;

  // Filter out the full Bundle versions
  const assets = latestRelease.assets.filter((asset) => {
    return !asset.browser_download_url.includes("full");
  });

  assets.forEach((asset) => {
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
        version: "v" + latestRelease.tag_name,
        notes: latestRelease.body,
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
