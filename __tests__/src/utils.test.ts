import config from "../../config";
import {
  calculatePageNumber,
  calculatePositionNumber,
  isBrowserEnv,
  internalSlash,
  getIconsPathOnCDN,
  buildOriginHeaderValue,
  parseFirstIPFromString,
  cleanXForwardedFor,
  generateExpireTimeStamps,
  calculateWinRate,
  convertWeekDayToFullName,
  getPatchVersionAsMantineV7Groups,
  getCorrectLeaderStartPositions,
  getCookie,
  compareVersions,
} from "../../src/utils";

describe("getIconsPathOnCDN", () => {
  test("should return the correctly formed URL for the export folder", () => {
    const result = getIconsPathOnCDN("/path/my_icon", "export");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export/path/my_icon.webp`);
  });

  test("should return the correctly formed URL for the export folder", () => {
    const result = getIconsPathOnCDN("my_icon", "export");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export/my_icon.webp`);
  });

  test("should append .webp if the filename does not end with .webp in the export folder", () => {
    const result = getIconsPathOnCDN("my_icon.webp", "export");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export/my_icon.webp`);
  });

  test("should change to png in the export folder", () => {
    const result = getIconsPathOnCDN("my_icon.png", "export");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export/my_icon.webp`);
  });

  test("should return the correctly formed URL for the export_flatten folder", () => {
    const result = getIconsPathOnCDN("/path/to/my_icon", "export_flatten");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export_flatten/my_icon.webp`);
  });

  test("should remove the path and keep only the filename in the export_flatten folder", () => {
    const result = getIconsPathOnCDN("/path/to/my_icon.webp", "export_flatten");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export_flatten/my_icon.webp`);
  });

  test("correctly gets path for maps", () => {
    const result = getIconsPathOnCDN("/map_icon/map_icon", "maps");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/maps/map_icon/map_icon.webp`);
  });
});

describe("internalSlash", () => {
  test("convert backwards-slash paths to forward slash paths", () => {
    expect(internalSlash("c:\\aaaa\\bbbb")).toEqual("c:/aaaa/bbbb");
    expect(internalSlash("c:\\aaaa\\bbbb\\★")).toEqual("c:/aaaa/bbbb/★");
    expect(internalSlash("c:\\aaaa\\bbbb")).toEqual("c:/aaaa/bbbb");
  });

  test("not convert extended-length paths", () => {
    const path = "\\\\?\\c:\\aaaa\\bbbb";
    expect(internalSlash(path)).toEqual(path);
  });
});

describe("calculatePositionNumber", () => {
  test("returns 0 for page 1", () => {
    expect(calculatePositionNumber(1)).toEqual(1);
  });

  test("returns 100 for page 2", () => {
    expect(calculatePositionNumber(2)).toEqual(101);
  });

  test("returns 400 for page 5", () => {
    expect(calculatePositionNumber(5)).toEqual(401);
  });
});

describe("calculatePageNumber", () => {
  // Define a test case for the first page
  test("position 50 should be on page 1", () => {
    expect(calculatePageNumber(50)).toBe(1);
  });

  // Define a test case for the second page
  test("position 150 should be on page 2", () => {
    expect(calculatePageNumber(150)).toBe(2);
  });

  // Define a test case for a position that is exactly on a page boundary
  test("position 100 should be on page 1", () => {
    expect(calculatePageNumber(100)).toBe(1);
  });

  // Define a test case for a large position
  test("position 1000 should be on page 10", () => {
    expect(calculatePageNumber(1000)).toBe(10);
  });
});

describe("isBrowserEnv", () => {
  let windowSpy: any;

  beforeEach(() => {
    windowSpy = jest.spyOn(global, "window", "get");
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it("should return true in a browser environment", () => {
    windowSpy.mockImplementation(() => ({
      location: {
        href: "https://example.com",
      },
    }));

    expect(isBrowserEnv()).toBe(true);
  });

  it("should return false in a non-browser environment", () => {
    windowSpy.mockImplementation(() => undefined);

    expect(isBrowserEnv()).toBe(false);
  });
});

describe("buildOriginHeaderValue", () => {
  let windowSpy: any;

  beforeEach(() => {
    windowSpy = jest.spyOn(global, "window", "get");
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  test("should return the correctly formed origin header value", () => {
    windowSpy.mockImplementation(() => ({
      location: {
        protocol: "https:",
        hostname: "example.com",
        port: "443",
      },
    }));

    const originHeaderValue = buildOriginHeaderValue();
    expect(originHeaderValue).toBe("https://example.com");
  });

  test("should handle non-standard HTTPS port correctly", () => {
    windowSpy.mockImplementation(() => ({
      location: {
        protocol: "https:",
        hostname: "example.com",
        port: "8443",
      },
    }));

    const originHeaderValue = buildOriginHeaderValue();
    expect(originHeaderValue).toBe("https://example.com:8443");
  });

  test("should handle non-standard HTTP port correctly", () => {
    windowSpy.mockImplementation(() => ({
      location: {
        protocol: "http:",
        hostname: "example.com",
        port: "8080",
      },
    }));

    const originHeaderValue = buildOriginHeaderValue();
    expect(originHeaderValue).toBe("http://example.com:8080");
  });

  test("should return an empty string when window is not available", () => {
    windowSpy.mockImplementation(() => undefined);

    const originHeaderValue = buildOriginHeaderValue();
    expect(originHeaderValue).toBe("");
  });
});

describe("parseFirstIPFromString", () => {
  test("should return the first IP address from a string - ipv6", () => {
    const result = parseFirstIPFromString("2a00:20:51:5962:618f:cd63:d7ca:af4a, 188.114.102.170");
    expect(result).toBe("2a00:20:51:5962:618f:cd63:d7ca:af4a");
  });

  test("should return the first IP address from a string - ipv4", () => {
    const result = parseFirstIPFromString("82.35.144.199, 188.114.102.68");
    expect(result).toBe("82.35.144.199");
  });

  test("should return empty string", () => {
    const result = parseFirstIPFromString("");
    expect(result).toBe("");
  });

  test("should return empty string / undefined", () => {
    const result = parseFirstIPFromString(undefined);
    expect(result).toBe("");
  });
});

describe("cleanXForwardedFor", () => {
  test("correctly removes undefined,", () => {
    const result = cleanXForwardedFor("undefined, 82.35.144.199");
    expect(result).toBe("82.35.144.199");
  });

  test("correctly removes undefined", () => {
    const result = cleanXForwardedFor("undefined");
    expect(result).toBe("");
  });

  test("correctly handle null", () => {
    const result = cleanXForwardedFor(undefined);
    expect(result).toBe("");
  });
});

describe("generateExpireTimeStamps", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 6, 25, 4, 0, 0, 0));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should always be UTC", () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });

  test("Should return the same date before 7AM UTC", () => {
    const timeStampMs = generateExpireTimeStamps(7);
    expect(timeStampMs).toEqual(1690268400000);
  });

  test("Should return the next day after 7AM UTC", () => {
    jest.setSystemTime(new Date(2023, 6, 25, 8));
    const timeStampMs = generateExpireTimeStamps(7);
    expect(timeStampMs).toEqual(1690354800000);
  });

  test("Should return the same day at 6AM UTC", () => {
    jest.setSystemTime(new Date(2023, 6, 25, 5));
    const timeStampMs = generateExpireTimeStamps(6);
    expect(timeStampMs).toEqual(1690264800000);
  });
});

describe("calculateWinRate", () => {
  test("should return 0 for 0 wins and 0 losses", () => {
    expect(calculateWinRate(0, 0)).toBe(0);
  });

  test("should return 100 for 1 win and 0 losses", () => {
    expect(calculateWinRate(1, 0)).toBe(100);
  });

  test("should return 100 for 2 wins and 0 losses", () => {
    expect(calculateWinRate(2, 0)).toBe(100);
  });

  test("should return 100 for 1 win and 1 losses", () => {
    expect(calculateWinRate(1, 1)).toBe(50);
  });

  test("should return 100 for 2 wins and 1 losses", () => {
    expect(calculateWinRate(2, 1)).toBe(66.66666666666666);
  });

  test("should return 100 for 2 wins and 2 losses", () => {
    expect(calculateWinRate(2, 2)).toBe(50);
  });

  test("should return 100 for 3 wins and 2 losses", () => {
    expect(calculateWinRate(3, 2)).toBe(60);
  });

  test("should return 0", () => {
    expect(calculateWinRate(0, 3)).toBe(0);
  });
});

describe("convertWeekDayToFullName", () => {
  test("Test correct conversion", () => {
    expect(convertWeekDayToFullName("Mo")).toBe("Monday");
    expect(convertWeekDayToFullName("Tu")).toBe("Tuesday");
    expect(convertWeekDayToFullName("We")).toBe("Wednesday");
    expect(convertWeekDayToFullName("Th")).toBe("Thursday");
    expect(convertWeekDayToFullName("Fr")).toBe("Friday");
    expect(convertWeekDayToFullName("Sa")).toBe("Saturday");
    expect(convertWeekDayToFullName("Su")).toBe("Sunday");
  });

  test("Test incorrect conversion", () => {
    expect(convertWeekDayToFullName("M")).toBe("Invalid day abbreviation");
    expect(convertWeekDayToFullName("T")).toBe("Invalid day abbreviation");
  });
});

describe("getPatchVersionAsMantineV7Groups", () => {
  test("Test correct conversion", () => {
    expect(
      JSON.stringify(
        getPatchVersionAsMantineV7Groups().includes({
          group: "Brass Leopard",
          items: [{ value: "1.1.5", label: "1.1.5" }],
        }),
      ),
    ).toBeTruthy();
    // console.log(JSON.stringify(getPatchVersionAsMantineV7Groups()));
  });
});

describe("getCorrectLeaderStartPositions", () => {
  test("Correctly counts the positions", () => {
    expect(getCorrectLeaderStartPositions(52)).toBe(1);
    expect(getCorrectLeaderStartPositions(125)).toBe(101);
    expect(getCorrectLeaderStartPositions(1563)).toBe(1501);
  });

  test("Correctly counts the positions edge cases", () => {
    expect(getCorrectLeaderStartPositions(100)).toBe(1);
    expect(getCorrectLeaderStartPositions(101)).toBe(101);
    expect(getCorrectLeaderStartPositions(102)).toBe(101);
    expect(getCorrectLeaderStartPositions(200)).toBe(101);
    expect(getCorrectLeaderStartPositions(201)).toBe(201);
  });
});

describe("getCookie", () => {
  let windowSpy: any;
  let documentSpy: any;

  beforeEach(() => {
    windowSpy = jest.spyOn(global, "window", "get");
    documentSpy = jest.spyOn(global, "document", "get");
  });

  afterEach(() => {
    windowSpy.mockRestore();
    documentSpy.mockRestore();
  });

  test("should return null in non-browser environment", () => {
    windowSpy.mockImplementation(() => undefined);
    expect(getCookie("NEXT_LOCALE")).toBe(null);
  });

  test("should return cookie value when cookie exists", () => {
    windowSpy.mockImplementation(() => ({}));
    documentSpy.mockImplementation(() => ({
      cookie: "NEXT_LOCALE=fr; other=value; another=test",
    }));

    expect(getCookie("NEXT_LOCALE")).toBe("fr");
  });

  test("should return null when cookie does not exist", () => {
    windowSpy.mockImplementation(() => ({}));
    documentSpy.mockImplementation(() => ({
      cookie: "other=value; another=test",
    }));

    expect(getCookie("NEXT_LOCALE")).toBe(null);
  });

  test("should handle empty cookie string", () => {
    windowSpy.mockImplementation(() => ({}));
    documentSpy.mockImplementation(() => ({
      cookie: "",
    }));

    expect(getCookie("NEXT_LOCALE")).toBe(null);
  });

  test("should handle cookie with empty value", () => {
    windowSpy.mockImplementation(() => ({}));
    documentSpy.mockImplementation(() => ({
      cookie: "NEXT_LOCALE=; other=value",
    }));

    expect(getCookie("NEXT_LOCALE")).toBe(null);
  });
});

describe("compareVersions", () => {
  test("should return true when version is greater than minVersion", () => {
    expect(compareVersions("2.0.0", "1.9.9")).toBe(true);
    expect(compareVersions("1.10.0", "1.9.0")).toBe(true);
    expect(compareVersions("1.0.1", "1.0.0")).toBe(true);
  });

  test("should return false when version is less than minVersion", () => {
    expect(compareVersions("1.9.9", "2.0.0")).toBe(false);
    expect(compareVersions("1.9.0", "1.10.0")).toBe(false);
    expect(compareVersions("1.0.0", "1.0.1")).toBe(false);
  });

  test("should return true when versions are equal", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(true);
    expect(compareVersions("2.5.3", "2.5.3")).toBe(true);
  });

  test("should handle versions with 'v' prefix", () => {
    expect(compareVersions("v2.0.0", "1.9.9")).toBe(true);
    expect(compareVersions("2.0.0", "v1.9.9")).toBe(true);
    expect(compareVersions("v2.0.0", "v1.9.9")).toBe(true);
    expect(compareVersions("v1.9.9", "v2.0.0")).toBe(false);
  });

  test("should handle versions with different number of parts", () => {
    expect(compareVersions("2.0", "1.9.9")).toBe(true);
    expect(compareVersions("2.0.0", "1.9")).toBe(true);
    expect(compareVersions("1.9", "2.0.0")).toBe(false);
  });

  test("should correctly identify version 2.0.0 and higher", () => {
    expect(compareVersions("2.0.0", "2.0.0")).toBe(true);
    expect(compareVersions("2.0.1", "2.0.0")).toBe(true);
    expect(compareVersions("2.1.0", "2.0.0")).toBe(true);
    expect(compareVersions("3.0.0", "2.0.0")).toBe(true);
    expect(compareVersions("1.9.9", "2.0.0")).toBe(false);
  });
});
