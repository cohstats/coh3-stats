import { StaticImageData } from "next/image";
import config from "../config";

const calculatePageNumber = (position: number, RECORD_PER_PAGE = 100) => {
  // Calculate the page number
  return Math.ceil(position / RECORD_PER_PAGE);
};

const calculatePositionNumber = (pageNumber: number, RECORD_PER_PAGE = 100) => {
  return (pageNumber - 1) * RECORD_PER_PAGE + 1;
};

const isBrowserEnv = () => {
  return typeof window !== "undefined";
};

/**
 * Converts the slashes to the correct ones
 * We don't need to use 3rd party shit module for this
 * @param path
 */
const internalSlash = (path: string) => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);

  if (isExtendedLengthPath) {
    return path;
  }

  return path.replace(/\\/g, "/");
};

/**
 * Get the path of the icon on our CDN hosting for images
 * @param iconPath The path of the icon, can be full path or just filename.
 * @param folder By default we look for whole path, but if you can't find the icon, you can try using "export_flatten" folder.
 */
const getIconsPathOnCDN = (
  // @ts-ignore
  iconPath: string | StaticRequire | StaticImageData,
  folder: "export" | "export_flatten" = "export",
) => {
  if (typeof iconPath !== "string") {
    return iconPath;
  }

  // If we are in export_flatten folder, we need to remove the whole path and just keep filename
  if (folder === "export_flatten") {
    iconPath = iconPath.split(/[\\/]/).pop() || "";
  }

  if (!iconPath.endsWith(".png")) {
    iconPath += ".png";
  }

  return internalSlash(`${config.CDN_ASSETS_HOSTING}/${folder}/${iconPath}`);
};

export { calculatePageNumber, calculatePositionNumber, isBrowserEnv, getIconsPathOnCDN };
