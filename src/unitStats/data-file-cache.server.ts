/**
 * Local disk cache of the coh3-data files, used ONLY on the server (build / SSR).
 *
 * The files are downloaded once before the build by `scripts/prefetch-data.ts` (yarn prebuild).
 * The build workers only read from here - they never write - so we don't have to download
 * the heavy files (ebps.json has ~90MB) in every worker for every locale.
 *
 * This module ends up in the client bundle too (fetch-mappings-withLogs is used in the browser),
 * that's why we don't `import fs from "fs"` - Turbopack can't resolve `fs` for the browser.
 * `process.getBuiltinModule` is invisible to the bundler. Never call these functions in the browser.
 */

import type * as FS from "fs";
import type * as Path from "path";

const getNodeModules = () => {
  return {
    fs: process.getBuiltinModule("fs") as typeof FS,
    path: process.getBuiltinModule("path") as typeof Path,
  };
};

/**
 * https://data.coh3stats.com/cohstats/coh3-data/v2.5.3-3/data/weapon.json
 * -> <cwd>/.next/cache/coh3-data/cohstats/coh3-data/v2.5.3-3/data/weapon.json
 */
const getCachePath = (url: string): string => {
  const { path } = getNodeModules();
  const { pathname } = new URL(url);

  return path.join(
    process.cwd(),
    ".next",
    "cache",
    "coh3-data",
    ...pathname.split("/").filter(Boolean),
  );
};

/**
 * Returns the parsed JSON from the disk cache, or undefined when the file is not cached.
 */
const readCachedJson = (url: string): any | undefined => {
  const { fs } = getNodeModules();
  const filePath = getCachePath(url);
  if (!fs.existsSync(filePath)) return undefined;

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

export { getCachePath, readCachedJson };
