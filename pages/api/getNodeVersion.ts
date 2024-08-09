import { logger } from "../../src/logger";
import { NextApiRequest, NextApiResponse } from "next";
import v8 from "v8";
import os from "os";

const systemInfo = {
  platform: os.platform(), // Operating system platform
  architecture: os.arch(), // CPU architecture
  cpuCores: os.cpus(), // CPU information
  totalMemory: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + " GB", // Total memory in GB
  freeMemory: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + " GB", // Free memory in GB
  uptime: (os.uptime() / 3600).toFixed(2) + " hours", // System uptime in hours
  homeDirectory: os.homedir(), // Home directory of the current user
  hostname: os.hostname(), // Hostname of the operating system
  networkInterfaces: os.networkInterfaces(), // Network interfaces
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.setHeader("Cache-Control", "public").status(200).json({
      nodeVersion: process.version,
      heap: v8.getHeapStatistics(),
      os: systemInfo,
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json({});
  }
}
