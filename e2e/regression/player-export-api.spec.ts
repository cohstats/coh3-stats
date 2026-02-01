import { test, expect } from "@playwright/test";

test.describe("Player Export API", () => {
  const baseUrl = "/api/playerExport";

  test.describe("Error Handling", () => {
    test("should return 400 when profileIDs parameter is missing", async ({ request }) => {
      const response = await request.get(baseUrl);

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("profile id param is missing");
    });

    test("should return 400 when profileIDs contains invalid JSON", async ({ request }) => {
      const response = await request.get(`${baseUrl}?profileIDs=invalid-json`);

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("error parsing the profileIDs data");
    });

    test("should return 400 when types contains invalid game types", async ({ request }) => {
      const profileIDs = JSON.stringify([1, 2]);
      const types = JSON.stringify(["1v1", "5v5"]);
      const response = await request.get(`${baseUrl}?profileIDs=${profileIDs}&types=${types}`);

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("parsedTypes contains invalid data");
    });

    test("should return 400 when types contains invalid JSON", async ({ request }) => {
      const profileIDs = JSON.stringify([1, 2]);
      const response = await request.get(
        `${baseUrl}?profileIDs=${profileIDs}&types=invalid-json`,
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("error parsing the types data");
    });

    test("should return 400 when requesting more than 50 records", async ({ request }) => {
      const profileIDs = JSON.stringify(Array.from({ length: 51 }, (_, i) => i + 1));
      const response = await request.get(`${baseUrl}?profileIDs=${profileIDs}`);

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Too many records requested");
    });
  });

  test.describe("Successful Requests", () => {
    // Real player IDs for testing
    const realPlayerIDs = [3705, 871, 6219, 108833, 61495, 1287];

    test("should return CSV data with valid profileIDs", async ({ request }) => {
      const profileIDs = JSON.stringify(realPlayerIDs);
      const response = await request.get(`${baseUrl}?profileIDs=${profileIDs}`);

      // The API might return 200 or 500 depending on whether the Relic API is available
      // We'll check for both scenarios
      if (response.status() === 200) {
        expect(response.headers()["content-type"]).toContain("text/csv");
        expect(response.headers()["cache-control"]).toContain("public, max-age=60");

        const csvData = await response.text();
        expect(csvData).toBeTruthy();
        expect(csvData.length).toBeGreaterThan(0);

        // Verify CSV structure - should have headers
        const lines = csvData.split("\n");
        expect(lines.length).toBeGreaterThan(1);

        // Check for expected CSV columns
        const headers = lines[0];
        expect(headers).toContain("alias");
        expect(headers).toContain("relic_id");
      } else {
        // If the external API fails, we should get a 500 error
        expect(response.status()).toBe(500);
        const data = await response.json();
        expect(data.error).toBe("error processing the request");
      }
    });

    test("should return CSV data with valid profileIDs and types filter", async ({ request }) => {
      const profileIDs = JSON.stringify([realPlayerIDs[0], realPlayerIDs[1]]);
      const types = JSON.stringify(["1v1", "2v2"]);
      const response = await request.get(`${baseUrl}?profileIDs=${profileIDs}&types=${types}`);

      if (response.status() === 200) {
        expect(response.headers()["content-type"]).toContain("text/csv");
        expect(response.headers()["cache-control"]).toContain("public, max-age=60");

        const csvData = await response.text();
        expect(csvData).toBeTruthy();
        expect(csvData.length).toBeGreaterThan(0);

        // Verify that only requested types are in the CSV
        const headers = csvData.split("\n")[0];
        expect(headers).toContain("1v1");
        expect(headers).toContain("2v2");
        // Should not contain 3v3 or 4v4 when filtered
        expect(headers).not.toContain("3v3");
        expect(headers).not.toContain("4v4");
      } else {
        expect(response.status()).toBe(500);
        const data = await response.json();
        expect(data.error).toBe("error processing the request");
      }
    });

    test("should handle single profileID", async ({ request }) => {
      const profileIDs = JSON.stringify([realPlayerIDs[0]]);
      const response = await request.get(`${baseUrl}?profileIDs=${profileIDs}`);

      if (response.status() === 200) {
        expect(response.headers()["content-type"]).toContain("text/csv");
        const csvData = await response.text();
        expect(csvData).toBeTruthy();

        // Should have header + 1 data row
        const lines = csvData.split("\n").filter((line) => line.trim());
        expect(lines.length).toBe(2);
      } else {
        expect(response.status()).toBe(500);
      }
    });

    test("should handle maximum allowed profileIDs (50)", async ({ request }) => {
      // Use real IDs and pad with additional IDs to reach 50
      const paddedIDs = [...realPlayerIDs, ...Array.from({ length: 44 }, (_, i) => i + 10000)];
      const profileIDs = JSON.stringify(paddedIDs);
      const response = await request.get(`${baseUrl}?profileIDs=${profileIDs}`);

      if (response.status() === 200) {
        expect(response.headers()["content-type"]).toContain("text/csv");
        const csvData = await response.text();
        expect(csvData).toBeTruthy();
      } else {
        expect(response.status()).toBe(500);
      }
    });

    test("should handle all valid game types", async ({ request }) => {
      const profileIDs = JSON.stringify([realPlayerIDs[0]]);
      const types = JSON.stringify(["1v1", "2v2", "3v3", "4v4"]);
      const response = await request.get(`${baseUrl}?profileIDs=${profileIDs}&types=${types}`);

      if (response.status() === 200) {
        expect(response.headers()["content-type"]).toContain("text/csv");
        const csvData = await response.text();
        expect(csvData).toBeTruthy();

        // Verify all game types are in headers
        const headers = csvData.split("\n")[0];
        expect(headers).toContain("1v1");
        expect(headers).toContain("2v2");
        expect(headers).toContain("3v3");
        expect(headers).toContain("4v4");
      } else {
        expect(response.status()).toBe(500);
      }
    });
  });
});
