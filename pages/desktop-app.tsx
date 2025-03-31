import { GetServerSideProps } from "next";
import { Octokit } from "octokit";

import DesktopAppPage from "../screens/desktop-app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default DesktopAppPage;

export const getServerSideProps: GetServerSideProps<any> = async ({ res, locale = "en" }) => {
  const octokit = new Octokit();
  const response = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
    owner: "cohstats",
    repo: "coh3-stats-desktop-app",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  console.log(`SSR - /desktop-app`);

  let downloadURL = "https://github.com/cohstats/coh3-stats-desktop-app/releases/latest"; // fallback in case request fails
  let downloadCount = 0;
  let version = "";
  if (response.status === 200) {
    const assets = response.data.assets.filter((asset: { browser_download_url: string }) => {
      if (asset.browser_download_url.split(".").at(-1) === "sig") {
        return false;
      } else if (asset.browser_download_url.includes("full")) {
        return false;
      }

      return true;
    });
    if (assets.length > 0) {
      downloadCount = assets
        .map((asset: { download_count: any }) => asset.download_count)
        .reduce((a: any, b: any) => a + b);
    }

    version = "v" + response.data.tag_name;
    const msiAsset = assets.find(
      (asset: { browser_download_url: string }) =>
        asset.browser_download_url.split(".").at(-1) === "msi",
    );
    if (msiAsset) {
      downloadURL = msiAsset.browser_download_url;
    }
  }

  res.setHeader(
    "Cache-Control",
    "public, max-age=600, s-maxage=1800, stale-while-revalidate=172800",
  );

  return {
    props: {
      downloadURL,
      downloadCount,
      version,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};
