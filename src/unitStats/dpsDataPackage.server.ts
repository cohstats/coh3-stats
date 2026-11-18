import { promises as fs } from "node:fs";
import path from "node:path";
import { gzipSync, gunzipSync } from "node:zlib";
import config from "../../config";
import { getDpsData } from "./dpsData.server";

type DpsDataPackage = { gzip: Buffer; json?: Buffer };
const packages = new Map<string, Promise<DpsDataPackage>>();
const packagePath = (patch: string) =>
  path.join(process.cwd(), ".next", "cache", "dps-data", `${patch}.json.gz`);

const encodePackage = async (patch: string): Promise<DpsDataPackage> => {
  const json = Buffer.from(JSON.stringify(await getDpsData(patch)));
  return { json, gzip: gzipSync(json) };
};

/** The prebuild prepares the current patch once, before Next starts its build workers. */
export const prepareDpsDataPackage = async () => {
  const data = await encodePackage(config.latestPatch);
  const target = packagePath(config.latestPatch);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await fs.writeFile(temporary, data.gzip);
  await fs.rename(temporary, target);
};

/** Cache both mapped and compressed data; failed preparations remain retryable. */
export const getDpsDataPackage = (patch: string): Promise<DpsDataPackage> => {
  let request = packages.get(patch);
  if (!request) {
    request = (async () => {
      // Development must reflect mapping edits instead of an earlier production build.
      if (process.env.NODE_ENV === "production" && patch === config.latestPatch) {
        try {
          return { gzip: await fs.readFile(packagePath(patch)) };
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        }
      }
      return encodePackage(patch);
    })();
    packages.set(patch, request);
    request.catch(() => {
      if (packages.get(patch) === request) packages.delete(patch);
    });
  }
  return request;
};

export const getDpsPackageBody = (data: DpsDataPackage, plainJson: boolean): Buffer => {
  if (!plainJson) return data.gzip;
  data.json ??= gunzipSync(data.gzip);
  return data.json;
};
