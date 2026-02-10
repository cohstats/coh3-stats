import { GetServerSideProps } from "next";
import { Octokit } from "octokit";

import DesktopAppPage from "../screens/desktop-app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default DesktopAppPage;

export const getServerSideProps: GetServerSideProps<any> = async ({ res, locale = "en" }) => {
  const octokit = new Octokit();

  console.log(`SSR - /desktop-app`);

  let downloadURL = "https://github.com/cohstats/coh3-stats-desktop-app/releases/latest"; // fallback in case request fails
  let downloadCount = 0;
  let version = "";
  let totalDownloadCount = 0;

  try {
    // Fetch last 20 releases - this includes the latest release
    const response = await octokit.request("GET /repos/{owner}/{repo}/releases", {
      owner: "cohstats",
      repo: "coh3-stats-desktop-app",
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (response.status === 200 && response.data.length > 0) {
      // Filter out draft releases
      const releases = response.data.filter((release: { draft: boolean }) => !release.draft);

      if (releases.length > 0) {
        // First release is the latest
        const latestRelease = releases[0];

        // Get latest release info
        const latestAssets = latestRelease.assets.filter(
          (asset: { browser_download_url: string }) => {
            if (asset.browser_download_url.split(".").at(-1) === "sig") {
              return false;
            } else if (asset.browser_download_url.includes("full")) {
              return false;
            }
            return true;
          },
        );

        if (latestAssets.length > 0) {
          downloadCount = latestAssets
            .map((asset: { download_count: number }) => asset.download_count)
            .reduce((a: number, b: number) => a + b);
        }

        version = "v" + latestRelease.tag_name;
        const msiAsset = latestAssets.find(
          (asset: { browser_download_url: string }) =>
            asset.browser_download_url.split(".").at(-1) === "msi",
        );
        if (msiAsset) {
          downloadURL = msiAsset.browser_download_url;
        }

        // Calculate total downloads across all releases
        totalDownloadCount = releases.reduce((total: number, release: any) => {
          const releaseAssets = release.assets.filter(
            (asset: { browser_download_url: string }) => {
              if (asset.browser_download_url.split(".").at(-1) === "sig") {
                return false;
              } else if (asset.browser_download_url.includes("full")) {
                return false;
              }
              return true;
            },
          );

          const releaseDownloads = releaseAssets.reduce(
            (sum: number, asset: { download_count: number }) => sum + asset.download_count,
            0,
          );

          return total + releaseDownloads;
        }, 0);
      }
    }
  } catch (error) {
    console.error("Failed to fetch releases:", error);
    // If fetching releases fails, use fallback values
    totalDownloadCount = 0;
  }

  res.setHeader(
    "Cache-Control",
    "public, max-age=600, s-maxage=1800, stale-while-revalidate=172800",
  );

  return {
    props: {
      downloadURL,
      downloadCount,
      totalDownloadCount,
      version,
      ...(await serverSideTranslations(locale, ["common", "desktopapp"])),
    },
  };
};
