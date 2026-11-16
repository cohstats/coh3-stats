/** @jest-environment node */

import axios from "axios";
import { fetchJsonWithLogging } from "../../../src/unitStats/fetch-mappings-withLogs";
import { isMissingMappingFile } from "../../../src/unitStats/mappingFileErrors";

jest.mock("axios", () => ({
  __esModule: true,
  default: { create: jest.fn(() => ({ get: jest.fn() })) },
}));
jest.mock("axios-retry", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../../src/unitStats/data-file-cache.server", () => ({
  readCachedJson: () => undefined,
}));

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

it.each([404, 503])(
  "preserves HTTP status %i through request and JSON error wrapping",
  async (status) => {
    const cause = Object.assign(new Error("Request failed"), { response: { status } });
    const get = jest.mocked(axios.create).mock.results[0].value.get as jest.Mock;
    get.mockRejectedValue(cause);

    const error = await fetchJsonWithLogging("https://example.test/data.json", "fixture").catch(
      (error: unknown) => error,
    );
    expect(error).toBeInstanceOf(Error);
    expect(isMissingMappingFile(error)).toBe(status === 404);
    expect((error as Error).cause).toHaveProperty("cause", cause);
  },
);
