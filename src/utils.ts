import { StaticImageData } from "next/image";
import dayjs from "dayjs";
import config from "../config";

export const calculatePageNumber = (position: number, RECORD_PER_PAGE = 100) => {
  // Calculate the page number
  return Math.ceil(position / RECORD_PER_PAGE);
};

export const calculatePositionNumber = (pageNumber: number, RECORD_PER_PAGE = 100) => {
  return (pageNumber - 1) * RECORD_PER_PAGE + 1;
};

export const isBrowserEnv = () => {
  return typeof window !== "undefined";
};

/**
 * Converts the slashes to the correct ones
 * We don't need to use 3rd party shit module for this
 * @param path
 */
export const internalSlash = (path: string) => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);

  if (isExtendedLengthPath) {
    return path;
  }

  return path.replace(/\\/g, "/");
};

export const getDateTimestamp = (date = new Date()): number => {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 1000;
};

export const getGMTTimeStamp = (date = new Date()) => {
  return (
    new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
    ).getTime() / 1000
  );
};

export const convertToDateString = (date = new Date(), allowNow = true) => {
  const oldDate = dayjs(date);
  const today = dayjs(new Date());

  // They are the same, it's today
  if (oldDate.diff(today, "day") === 0 && allowNow) {
    return "now";
  } else {
    return dayjs(date).format("YYYY-MM-DD");
  }
};

export const convertFromDateString = (dateString: string) => {
  if (dateString === "now") {
    return dayjs(dayjs(new Date()).format("YYYY-MM-DD")).toDate();
  } else {
    return dayjs(dateString).toDate();
  }
};

export const findPatchVersionByToAndFrom = (from: string, to: string) => {
  for (const [patch, value] of Object.entries(config.statsPatchSelector)) {
    if (value.from === from && value.to === to) {
      return patch;
    }
  }
  return null;
};

export const sortArrayOfObjectsByTheirPropertyValue = (
  mapsData: Array<Record<string, string>>,
): Array<Record<string, string>> => {
  return mapsData.sort((a, b) => {
    if (a.value < b.value) {
      return -1;
    }
    if (a.value > b.value) {
      return 1;
    }
    return 0;
  });
};

/**
 * Get the path of the icon on our CDN hosting for images
 * @param iconPath The path of the icon, can be full path or just filename.
 * @param folder By default we look for whole path, but if you can't find the icon, you can try using "export_flatten" folder.
 */
export const getIconsPathOnCDN = (
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

  // Remove double // in case we have them in the path
  const urlPath = `/${folder}/${iconPath}`.replace(/\/\//g, "/");

  return internalSlash(`${config.CDN_ASSETS_HOSTING}${urlPath}`);
};

// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser/11381730#11381730
// prettier-ignore
export const isMobileCheck = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    )
      check = true;
  })(navigator.userAgent);
  return check;
};

export const buildOriginHeaderValue = () => {
  if (window) {
    const scheme = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    if ((scheme === "https:" && port === "443") || (scheme === "http:" && port === "80")) {
      return `${scheme}//${hostname}`;
    } else {
      return `${scheme}//${hostname}:${port}`;
    }
  } else {
    return "";
  }
};

/**
 * This functions removes any undefined from the string
 * @param ips
 */
export const cleanXForwardedFor = (ips: string | undefined) => {
  if (ips) {
    return ips.replace(/undefined,?/g, "").trim();
  } else {
    return "";
  }
};

export const parseFirstIPFromString = (ips: string | undefined) => {
  if (ips) {
    return ips.split(",")[0];
  } else {
    return "";
  }
};

/**
 * Generates a timestamp for when the stats should expire.
 * @param hoursWhenToExpire
 */
export const generateExpireTimeStamps = (hoursWhenToExpire: number = 7): number => {
  const currentDate = new Date();
  const sixAMToday = Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
    hoursWhenToExpire,
    0,
    0,
  );

  if (dayjs(currentDate).isBefore(dayjs(sixAMToday))) {
    return sixAMToday;
  } else {
    return dayjs(sixAMToday).add(1, "day").toDate().getTime();
  }
};

export const calculateWinRate = (wins: number, losses: number): number => {
  if (wins > 0 && !losses) return 100;
  if (losses > 0 && !wins) return 0;

  if (wins + losses === 0) {
    return 0;
  } else {
    return (wins / (wins + losses)) * 100;
  }
};

export const convertWeekDayToFullName = (dayAbbreviation: string): string => {
  switch (dayAbbreviation) {
    case "Mo":
      return "Monday";
    case "Tu":
      return "Tuesday";
    case "We":
      return "Wednesday";
    case "Th":
      return "Thursday";
    case "Fr":
      return "Friday";
    case "Sa":
      return "Saturday";
    case "Su":
      return "Sunday";
    default:
      return "Invalid day abbreviation";
  }
};
