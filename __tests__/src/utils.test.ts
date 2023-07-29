import config from "../../config";
import {
  calculatePageNumber,
  calculatePositionNumber,
  isBrowserEnv,
  internalSlash,
  getIconsPathOnCDN,
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
