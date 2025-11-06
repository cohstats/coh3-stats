/**
 * This route is used be the desktop app to determine if the auto updater should update the app
 * This route handles v1.x updates only
 */

import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";

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
  console.log(`SSR - /api/appUpdateRoute`);

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

  const validReleases = response.data as GitHubRelease[];
  if (validReleases.length === 0) {
    return res.status(404).json({
      message: "No releases found",
    });
  }

  // Get the latest valid v1.x release (first one in the filtered list)
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
      message: "Could not find required assets in latest v1.x release.",
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
