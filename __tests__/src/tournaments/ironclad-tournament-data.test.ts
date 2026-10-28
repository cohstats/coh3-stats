/**
 * @jest-environment node
 */

import {
  getIroncladHubResult,
  getIroncladOverviewResult,
  getIroncladTournamentPageResult,
} from "../../../src/tournaments/ironclad-tournament-data";
import {
  getIroncladTournament,
  getIroncladTournaments,
} from "../../../src/apis/ironclad-tournament-api";
import type { IroncladTournament } from "../../../src/apis/ironclad-tournament-api";
import { getLadderPlayerNames } from "../../../src/tournaments/ladder-tournament-names";
import tournamentsResponse from "../../test-assets/ironclad-tournaments-response.json";

jest.mock("../../../src/apis/ironclad-tournament-api", () => ({
  getIroncladTournaments: jest.fn(),
  getIroncladTournament: jest.fn(),
}));
jest.mock("../../../src/tournaments/ladder-tournament-names", () => ({
  getLadderPlayerNames: jest.fn(),
}));

const mockedTournaments = getIroncladTournaments as jest.Mock;
const mockedTournament = getIroncladTournament as jest.Mock;
const mockedNames = getLadderPlayerNames as jest.Mock;

const tournaments = tournamentsResponse.data as IroncladTournament[];
const [holdTheLine, theNewFront] = tournaments;

describe("ironclad-tournament-data", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedNames.mockResolvedValue({});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getIroncladHubResult", () => {
    it("returns the summary with the short revalidate while a tournament runs", async () => {
      mockedTournaments.mockResolvedValue(tournaments);

      const result = await getIroncladHubResult();

      expect(result.summary?.featured.slug).toBe("hold-the-line");
      expect(result.revalidate).toBe(600);
    });

    it("looks up the names of the hub tournament champions only", async () => {
      mockedTournaments.mockResolvedValue(tournaments);

      await getIroncladHubResult();

      const ids: number[] = mockedNames.mock.calls[0][0];
      const championIds = theNewFront.divisions
        .map(
          (division) =>
            division.participants.find(
              (p) => p.registrationId === division.bracket?.championRegistrationId,
            )?.relicProfileId,
        )
        .filter(Boolean)
        .map(Number);
      expect(ids).toEqual(championIds);
    });

    it("uses the long revalidate when everything is completed", async () => {
      mockedTournaments.mockResolvedValue([theNewFront]);

      await expect(getIroncladHubResult()).resolves.toMatchObject({ revalidate: 3600 });
    });

    it("returns null summary with the error revalidate when the API fails", async () => {
      mockedTournaments.mockRejectedValue(new Error("boom"));

      await expect(getIroncladHubResult()).resolves.toEqual({ summary: null, revalidate: 60 });
    });
  });

  describe("getIroncladOverviewResult", () => {
    it("returns all the tournaments", async () => {
      mockedTournaments.mockResolvedValue(tournaments);

      const result = await getIroncladOverviewResult();

      expect(result.data?.tournaments.map((t) => t.slug)).toEqual([
        "hold-the-line",
        "the-new-front",
      ]);
      expect(result.revalidate).toBe(600);
    });

    it("returns null data when the API fails", async () => {
      mockedTournaments.mockRejectedValue(new Error("boom"));

      await expect(getIroncladOverviewResult()).resolves.toEqual({ data: null, revalidate: 60 });
    });
  });

  describe("getIroncladTournamentPageResult", () => {
    it("returns the tournament with the participant names", async () => {
      mockedTournament.mockResolvedValue(theNewFront);
      mockedNames.mockResolvedValue({ 1188298: { alias: "CartelCub", country: "us" } });

      const result = await getIroncladTournamentPageResult("the-new-front");

      expect(mockedTournament).toHaveBeenCalledWith("the-new-front");
      expect(result).toMatchObject({ status: "ok", revalidate: 3600 });
      if (result.status !== "ok") throw new Error("Expected ok");
      const academy = result.data.divisions.find((d) => d.key === "academy")!;
      const cartel = academy.participants.find((p) => p.relicId === 1188298);
      expect(cartel?.country).toBe("us");
    });

    it("uses the short revalidate for a running tournament", async () => {
      mockedTournament.mockResolvedValue(holdTheLine);

      await expect(getIroncladTournamentPageResult("hold-the-line")).resolves.toMatchObject({
        status: "ok",
        revalidate: 600,
      });
    });

    it("returns notFound when the tournament doesn't exist", async () => {
      mockedTournament.mockResolvedValue(null);

      await expect(getIroncladTournamentPageResult("nope")).resolves.toEqual({
        status: "notFound",
        revalidate: 3600,
      });
    });

    it("returns unavailable when the API fails", async () => {
      mockedTournament.mockRejectedValue(new Error("boom"));

      await expect(getIroncladTournamentPageResult("hold-the-line")).resolves.toEqual({
        status: "unavailable",
        revalidate: 60,
      });
    });
  });
});
