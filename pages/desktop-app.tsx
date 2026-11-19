import { GetStaticProps } from "next";
import { Octokit } from "octokit";

import DesktopAppPage from "../screens/desktop-app";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

export default DesktopAppPage;

type DesktopAppReleaseData = {
  downloadURL: string;
  downloadCount: number;
  totalDownloadCount: number;
  version: string;
};

// getStaticProps runs once per locale, so share a single GitHub request between them.
// We cache the promise (not the result) so concurrent locale builds also reuse the in-flight request.
const RELEASES_CACHE_TTL_MS = 5 * 60 * 1000;
let releasesCache: { promise: Promise<DesktopAppReleaseData>; timestamp: number } | null = null;

const getReleaseData = (): Promise<DesktopAppReleaseData> => {
  if (releasesCache && Date.now() - releasesCache.timestamp < RELEASES_CACHE_TTL_MS) {
    return releasesCache.promise;
  }

  const promise = fetchReleaseData();
  releasesCache = { promise, timestamp: Date.now() };
  return promise;
};

const fetchReleaseData = async (): Promise<DesktopAppReleaseData> => {
  const octokit = new Octokit();

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
    // Don't keep the fallback values cached, so the next locale / revalidation retries
    releasesCache = null;
    // If fetching releases fails, use fallback values
    totalDownloadCount = 0;
  }

  return { downloadURL, downloadCount, totalDownloadCount, version };
};

export const getStaticProps: GetStaticProps<any> = async ({ locale = "en" }) => {
  console.log(`ISR - /desktop-app`);

  const { downloadURL, downloadCount, totalDownloadCount, version } = await getReleaseData();

  return {
    props: {
      downloadURL,
      downloadCount,
      totalDownloadCount,
      version,
      ...(await serverSideTranslations(locale, ["common", "desktopapp"])),
    },
    // Revalidate every 1800 seconds (30 minutes) as specified in the original s-maxage
    revalidate: 1800,
  };
};
