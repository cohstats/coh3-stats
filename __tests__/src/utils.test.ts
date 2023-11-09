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
} from "../../src/utils";

describe("getIconsPathOnCDN", () => {
  test("should return the correctly formed URL for the export folder", () => {
    const result = getIconsPathOnCDN("/path/my_icon", "export");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export/path/my_icon.png`);
  });

  test("should return the correctly formed URL for the export folder", () => {
    const result = getIconsPathOnCDN("my_icon", "export");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export/my_icon.png`);
  });

  test("should append .png if the filename does not end with .png in the export folder", () => {
    const result = getIconsPathOnCDN("my_icon.png", "export");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export/my_icon.png`);
  });

  test("should return the correctly formed URL for the export_flatten folder", () => {
    const result = getIconsPathOnCDN("/path/to/my_icon", "export_flatten");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export_flatten/my_icon.png`);
  });

  test("should remove the path and keep only the filename in the export_flatten folder", () => {
    const result = getIconsPathOnCDN("/path/to/my_icon.png", "export_flatten");
    expect(result).toBe(`${config.CDN_ASSETS_HOSTING}/export_flatten/my_icon.png`);
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
