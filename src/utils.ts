import { StaticImageData } from "next/image";

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
 * This function returns path to an icon based just on its name.
 * It's utilizing all exported icons which are flattened.
 * @param iconName
 */
// @ts-ignore
const exportedIconPath = (iconName: string | StaticRequire | StaticImageData) => {
  if (typeof iconName !== "string") {
    return iconName;
  }
  let filename = iconName.split(/[\\/]/).pop() || "";

  if (!filename) {
    return "/icons/common/units/icons/placeholder_unit_icon.png";
  }

  if (!filename.endsWith(".png")) {
    filename += ".png";
  }

  return `/assets/icons/exported/${filename}`;
};

export { calculatePageNumber, calculatePositionNumber, isBrowserEnv, exportedIconPath };
