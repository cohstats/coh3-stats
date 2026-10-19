import { isBlockedByChallenge, reloadIfBlockedByChallenge } from "../../src/cloudflare-challenge";

describe("cloudflare-challenge", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    jest.restoreAllMocks();
  });

  describe("isBlockedByChallenge", () => {
    test("treats a failed fetch as the challenge", () => {
      expect(isBlockedByChallenge(new TypeError("Failed to fetch"))).toBe(true);
    });

    test("ignores other errors", () => {
      expect(isBlockedByChallenge(new Error("Error getting live games: 500"))).toBe(false);
      expect(isBlockedByChallenge(new SyntaxError("Unexpected token"))).toBe(false);
      expect(isBlockedByChallenge("error")).toBe(false);
    });

    test("ignores a failed fetch while offline", () => {
      jest.spyOn(navigator, "onLine", "get").mockReturnValue(false);
      expect(isBlockedByChallenge(new TypeError("Failed to fetch"))).toBe(false);
    });
  });

  describe("reloadIfBlockedByChallenge", () => {
    test("reloads once for the challenge", () => {
      const reload = jest.fn();

      expect(reloadIfBlockedByChallenge(new TypeError("Failed to fetch"), reload)).toBe(true);
      expect(reload).toHaveBeenCalledTimes(1);

      // Still failing after the reload - don't loop
      expect(reloadIfBlockedByChallenge(new TypeError("Failed to fetch"), reload)).toBe(false);
      expect(reload).toHaveBeenCalledTimes(1);
    });

    test("reloads again after the cooldown", () => {
      const reload = jest.fn();
      const now = jest.spyOn(Date, "now").mockReturnValue(1_000_000);

      expect(reloadIfBlockedByChallenge(new TypeError("Failed to fetch"), reload)).toBe(true);
      now.mockReturnValue(1_000_000 + 61 * 1000);
      expect(reloadIfBlockedByChallenge(new TypeError("Failed to fetch"), reload)).toBe(true);
      expect(reload).toHaveBeenCalledTimes(2);
    });

    test("doesn't reload for other errors", () => {
      const reload = jest.fn();

      expect(reloadIfBlockedByChallenge(new Error("Error getting live games: 500"), reload)).toBe(
        false,
      );
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
