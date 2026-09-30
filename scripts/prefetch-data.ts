/**
 * Downloads the coh3-data files of the latest patch into the local disk cache before the build.
 * Runs automatically as `yarn prebuild`.
 *
 * The build (4-6 workers, 1000+ pages, all locales) needs the same heavy files (ebps.json ~90MB)
 * again and again. Downloading them while the workers are busy prerendering was failing with
 * ECONNRESET - CF resets the connection when the client is too busy to read the body.
 * So we download them once here, in an idle process, and the workers read them from the disk.
 * See src/unitStats/data-file-cache.server.ts and fetchJsonWithLogging.
 *
 * Files which are not prefetched (older patches, ...) are still downloaded from the network during the build.
 */
import fs from "fs";
import path from "path";
import axios from "axios";
import config from "../config";
import { getCachePath } from "../src/unitStats/data-file-cache.server";
import { resolvePatchLocstringLocale } from "../src/explorer/patch-locstring";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require("../next-i18next.config");

const DATA_FILES = [
  "weapon.json",
  "ebps.json",
  "sbps.json",
  "abilities.json",
  "upgrade.json",
  "battlegroup.json",
  "daily_challenges_store_release.json",
  "weekly_challenges_store_release.json",
  "fs-perks.json",
  "fs-technologies.json",
  "mp-maps.json",
];

const CONCURRENCY = 3;
const MAX_ATTEMPTS = 5;
const TIMEOUT_MS = 120000;

const getUrls = (): string[] => {
  const urls = DATA_FILES.map((file) => config.getPatchDataUrl(file));

  for (const locale of i18n.locales as string[]) {
    // unitStats fetchLocstring uses the app locale as is, the explorer maps it to the data locale
    urls.push(config.getPatchDataLocaleUrl(locale));
    urls.push(config.getPatchDataLocaleUrl(resolvePatchLocstringLocale(locale)));
  }

  return [...new Set(urls)];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @returns "cached" | "downloaded" | "missing" (404)
 */
const prefetchFile = async (url: string): Promise<string> => {
  const filePath = getCachePath(url);

  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) return "cached";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: TIMEOUT_MS,
      });
      const data = Buffer.from(response.data);

      // Make sure we store valid JSON, the build would fail on it otherwise
      JSON.parse(data.toString("utf-8"));

      // Write to temp file first and then rename, so we never leave half written file in the cache
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const tmpPath = `${filePath}.${process.pid}.tmp`;
      fs.writeFileSync(tmpPath, data);
      fs.renameSync(tmpPath, filePath);

      return "downloaded";
    } catch (error: any) {
      // The file doesn't exist for this patch, e.g. locale which the data repo doesn't have
      if (error.response?.status === 404) return "missing";

      const reason = `${error.code || ""} ${error.message || String(error)}`.trim();
      console.warn(`[Prefetch] Attempt ${attempt}/${MAX_ATTEMPTS} failed for ${url}: ${reason}`);

      if (attempt === MAX_ATTEMPTS) throw new Error(`Failed to prefetch ${url}: ${reason}`);
      await sleep(1000 * 2 ** attempt);
    }
  }

  throw new Error(`Failed to prefetch ${url}`);
};

const prefetchData = async () => {
  const urls = getUrls();
  const start = Date.now();
  console.log(`[Prefetch] Prefetching ${urls.length} data files for patch ${config.latestPatch}`);

  const queue = [...urls];
  const failed: string[] = [];

  const worker = async () => {
    let url: string | undefined;
    while ((url = queue.shift())) {
      try {
        const result = await prefetchFile(url);
        console.log(`[Prefetch] ${result}: ${url}`);
      } catch (error) {
        console.error(`[Prefetch] ${error instanceof Error ? error.message : String(error)}`);
        failed.push(url);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`[Prefetch] Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);

  if (failed.length) {
    console.error(`[Prefetch] Failed to prefetch ${failed.length} files:\n${failed.join("\n")}`);
    process.exit(1);
  }
};

prefetchData();
