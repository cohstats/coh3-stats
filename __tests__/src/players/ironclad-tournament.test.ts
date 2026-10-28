import {
  buildIroncladTournament,
  getIroncladEntryResult,
} from "../../../src/players/tournaments";
import type {
  IroncladMatch,
  IroncladPlayerData,
  IroncladPlayerEntry,
} from "../../../src/apis/ironclad-tournament-api";
import playerTournamentsResponse from "../../test-assets/ironclad-player-tournaments-response.json";
import tournamentsResponse from "../../test-assets/ironclad-tournaments-response.json";

const entries = playerTournamentsResponse.data.entries as IroncladPlayerEntry[];
const [holdTheLineEntry, newFrontEntry] = entries;
const academy = tournamentsResponse.data[1].divisions[0];
const BRACKET_ID = academy.bracket!.id;

const data: IroncladPlayerData = {
  history: {
    relicProfileId: "1188298",
    currentIdentity: playerTournamentsResponse.data.currentIdentity,
    entries,
    aggregate: { tournamentsEntered: 2, matchesPlayed: 1, wins: 0, losses: 1, titles: 0 },
  },
  registrations: Object.fromEntries(
    academy.participants.map((p) => [
      p.registrationId,
      { eventAlias: p.eventAlias, relicProfileId: p.relicProfileId },
    ]),
  ),
  finalRounds: { [BRACKET_ID]: 3 },
};

const match = (overrides: Partial<IroncladMatch>): IroncladMatch => ({
  ...newFrontEntry.matches[0],
  ...overrides,
});

describe("getIroncladEntryResult", () => {
  test("is the champion when the API says so", () => {
    expect(getIroncladEntryResult({ ...newFrontEntry, champion: true }, 3)).toEqual({
      result: "champion",
      eliminatedIn: null,
    });
  });

  test("is eliminated in the round of the lost match", () => {
    expect(getIroncladEntryResult(newFrontEntry, 3)).toEqual({
      result: "eliminated",
      eliminatedIn: "Quarter Finals",
    });
  });

  test("is the runner-up after losing the final", () => {
    const entry = {
      ...newFrontEntry,
      matches: [match({ roundNumber: 3, roundName: "Grand Final" })],
    };

    expect(getIroncladEntryResult(entry, 3)).toEqual({ result: "runnerUp", eliminatedIn: null });
  });

  test("is in progress with a bracket and no lost match", () => {
    const entry = {
      ...newFrontEntry,
      matches: [match({ winnerRegistrationId: newFrontEntry.registrationId })],
    };

    expect(getIroncladEntryResult(entry, 3).result).toBe("inProgress");
  });

  test("is registered without a bracket", () => {
    expect(getIroncladEntryResult(holdTheLineEntry, undefined)).toEqual({
      result: "registered",
      eliminatedIn: null,
    });
  });
});

describe("buildIroncladTournament", () => {
  test("builds the entries with the opponents resolved", () => {
    const tournament = buildIroncladTournament(data);

    expect(tournament.unavailable).toBe(false);
    expect(tournament.aggregate).toEqual({
      tournaments: 2,
      matches: 1,
      wins: 0,
      losses: 1,
      titles: 0,
    });
    expect(tournament.entries.map((entry) => [entry.tournamentSlug, entry.divisionKey])).toEqual([
      ["hold-the-line", "academy"],
      ["the-new-front", "academy"],
    ]);

    const [quarterFinal] = tournament.entries[1].matches;
    expect(quarterFinal).toMatchObject({
      roundName: "Quarter Finals",
      // The player is the player two of the match
      playerScore: 0,
      opponentScore: 2,
      won: false,
      forfeit: false,
      opponent: { eventAlias: "Highcammax", relicId: null },
    });
  });

  test("keeps the decided opponent unknown when the registrations couldn't be loaded", () => {
    const tournament = buildIroncladTournament({ ...data, registrations: {}, finalRounds: {} });

    expect(tournament.entries[1].matches[0].opponent).toEqual({ eventAlias: "?", relicId: null });
  });

  test("is unavailable without the history", () => {
    const tournament = buildIroncladTournament({
      history: null,
      registrations: {},
      finalRounds: {},
    });

    expect(tournament.unavailable).toBe(true);
    expect(tournament.entries).toEqual([]);
  });
});
