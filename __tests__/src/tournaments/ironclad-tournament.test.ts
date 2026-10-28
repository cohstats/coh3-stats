import {
  buildBracketRounds,
  buildIroncladHubSummary,
  buildIroncladOverviewData,
  buildIroncladPlayer,
  buildIroncladTournamentView,
  getDefaultDivisionKey,
  getDivisionKey,
  getIroncladChampionRelicIds,
  getIroncladParticipantRelicIds,
  pickFeaturedTournament,
  sortIroncladTournaments,
  toRelicId,
} from "../../../src/tournaments/ironclad-tournament";
import type { IroncladTournament } from "../../../src/apis/ironclad-tournament-api";
import tournamentsResponse from "../../test-assets/ironclad-tournaments-response.json";

const tournaments = tournamentsResponse.data as IroncladTournament[];
const [holdTheLine, theNewFront] = tournaments;

describe("ironclad-tournament", () => {
  describe("getDivisionKey", () => {
    it("builds the URL key from the canonical name", () => {
      expect(getDivisionKey({ canonicalName: "Academy" })).toBe("academy");
      expect(getDivisionKey({ canonicalName: "Main / Pro" })).toBe("main-pro");
    });
  });

  describe("toRelicId", () => {
    it("parses the relic profile ID", () => {
      expect(toRelicId("1188298")).toBe(1188298);
      expect(toRelicId(null)).toBeNull();
      expect(toRelicId("")).toBeNull();
      expect(toRelicId("abc")).toBeNull();
      expect(toRelicId("-5")).toBeNull();
    });
  });

  describe("buildIroncladPlayer", () => {
    const participant = holdTheLine.divisions[0].participants[1];

    it("adds the current Relic name when known", () => {
      expect(
        buildIroncladPlayer(participant, { 1188298: { alias: "Cartel", country: "us" } }),
      ).toEqual({
        registrationId: participant.registrationId,
        eventAlias: "CartelCub",
        eventElo: 824,
        relicId: 1188298,
        alias: "Cartel",
        country: "us",
        profileUrl: participant.profileUrl,
      });
    });

    it("keeps alias and country null without a Relic profile", () => {
      const player = buildIroncladPlayer(holdTheLine.divisions[0].participants[0], {});
      expect(player.relicId).toBeNull();
      expect(player.alias).toBeNull();
      expect(player.country).toBeNull();
    });
  });

  describe("buildBracketRounds", () => {
    const academy = theNewFront.divisions[0];
    const players = new Map(
      academy.participants.map((p) => [p.registrationId, buildIroncladPlayer(p, {})]),
    );

    it("groups the matches by round in order", () => {
      const rounds = buildBracketRounds(academy.bracket!, players);

      expect(rounds.map((round) => [round.roundName, round.matches.length])).toEqual([
        ["Quarter Finals", 4],
        ["Semi Finals", 2],
        ["Grand Final", 1],
      ]);
      expect(rounds[0].matches.map((match) => match.matchNumber)).toEqual([1, 2, 3, 4]);
    });

    it("resolves the players, scores and the winner", () => {
      const final = buildBracketRounds(academy.bracket!, players)[2].matches[0];

      expect(final.bestOf).toBe(5);
      expect(
        final.slots.map((slot) => [slot.player?.eventAlias, slot.score, slot.isWinner]),
      ).toEqual([
        ["DarthYukat", 3, true],
        ["Highcammax", 2, false],
      ]);
    });

    it("marks the forfeits", () => {
      const quarterFinals = buildBracketRounds(academy.bracket!, players)[0].matches;

      expect(quarterFinals.map((match) => match.forfeit)).toEqual([false, false, true, false]);
    });

    it("keeps the undecided slots empty", () => {
      const pro = holdTheLine.divisions[3];
      const proPlayers = new Map(
        pro.participants.map((p) => [p.registrationId, buildIroncladPlayer(p, {})]),
      );
      const [quarterFinals, semiFinals] = buildBracketRounds(pro.bracket!, proPlayers);

      expect(quarterFinals.matches[0].slots[0].player?.eventAlias).toBe("Theodosios");
      expect(quarterFinals.matches[0].slots[0].isWinner).toBe(false);
      expect(semiFinals.matches[0].slots).toEqual([
        { player: null, score: null, isWinner: false },
        { player: null, score: null, isWinner: false },
      ]);
    });
  });

  describe("buildIroncladTournamentView", () => {
    it("builds the divisions with champions and participants by ELO", () => {
      const view = buildIroncladTournamentView(theNewFront, {});

      expect(view.registrationOpen).toBe(false);
      expect(
        view.divisions.map((division) => [division.key, division.champion?.eventAlias]),
      ).toEqual([
        ["academy", "DarthYukat"],
        ["challenge", "GL1TCH"],
        ["main", "Reakly"],
      ]);
      const elos = view.divisions[0].participants.map((player) => player.eventElo ?? 0);
      expect(elos).toEqual([...elos].sort((a, b) => b - a));
    });

    it("has no rounds for the divisions without a bracket", () => {
      const view = buildIroncladTournamentView(holdTheLine, {});

      expect(view.divisions.map((division) => division.rounds === null)).toEqual([
        true,
        true,
        true,
        false,
      ]);
      expect(view.divisions[3].champion).toBeNull();
    });
  });

  describe("getDefaultDivisionKey", () => {
    it("prefers the running division", () => {
      expect(getDefaultDivisionKey(buildIroncladTournamentView(holdTheLine, {}).divisions)).toBe(
        "pro",
      );
    });

    it("falls back to the first division with a bracket, then the first one", () => {
      const divisions = buildIroncladTournamentView(theNewFront, {}).divisions;
      expect(getDefaultDivisionKey(divisions)).toBe("academy");
      expect(
        getDefaultDivisionKey([
          { key: "a", state: "filling", rounds: null },
          { key: "b", state: "completed", rounds: [] },
        ]),
      ).toBe("b");
      expect(getDefaultDivisionKey([{ key: "a", state: "filling", rounds: null }])).toBe("a");
      expect(getDefaultDivisionKey([])).toBeNull();
    });
  });

  describe("sortIroncladTournaments / pickFeaturedTournament", () => {
    const tournament = (slug: string, status: string, firstCompletedAt: string | null = null) =>
      ({ ...holdTheLine, id: slug, slug, status, firstCompletedAt }) as IroncladTournament;

    it("orders running, registration open, upcoming, unknown, then completed from the newest", () => {
      const sorted = sortIroncladTournaments([
        tournament("old", "completed", "2026-01-01T00:00:00Z"),
        tournament("upcoming", "upcoming"),
        tournament("new", "completed", "2026-06-01T00:00:00Z"),
        tournament("unknown", "paused"),
        tournament("registration", "registration_open"),
        tournament("running", "in_progress"),
      ]);

      expect(sorted.map((t) => t.slug)).toEqual([
        "running",
        "registration",
        "upcoming",
        "unknown",
        "new",
        "old",
      ]);
    });

    it("picks the running tournament", () => {
      expect(pickFeaturedTournament(tournaments)?.slug).toBe("hold-the-line");
      expect(pickFeaturedTournament([])).toBeNull();
    });
  });

  describe("buildIroncladHubSummary", () => {
    it("has the featured tournament and the last completed one", () => {
      const summary = buildIroncladHubSummary(tournaments, {})!;

      expect(summary.tournamentsCount).toBe(2);
      expect(summary.featured.slug).toBe("hold-the-line");
      expect(summary.featured.registrationOpen).toBe(true);
      expect(
        summary.featured.divisions.map((d) => [d.key, d.approvedCount, d.capacity, d.state]),
      ).toEqual([
        ["academy", 6, 8, "filling"],
        ["challenge", 4, 8, "filling"],
        ["main", 4, 8, "filling"],
        ["pro", 8, 8, "in_progress"],
      ]);
      expect(summary.lastCompleted?.slug).toBe("the-new-front");
      expect(summary.lastCompleted?.divisions.map((d) => d.champion?.eventAlias)).toEqual([
        "DarthYukat",
        "GL1TCH",
        "Reakly",
      ]);
    });

    it("has no separate last completed when the featured is the completed one", () => {
      const summary = buildIroncladHubSummary([theNewFront], {})!;

      expect(summary.featured.slug).toBe("the-new-front");
      expect(summary.lastCompleted).toBeNull();
    });

    it("is null without tournaments", () => {
      expect(buildIroncladHubSummary([], {})).toBeNull();
    });
  });

  describe("buildIroncladOverviewData", () => {
    it("lists the tournaments in the display order", () => {
      expect(
        buildIroncladOverviewData([theNewFront, holdTheLine], {}).tournaments.map((t) => t.slug),
      ).toEqual(["hold-the-line", "the-new-front"]);
    });
  });

  describe("relic IDs for the name lookup", () => {
    it("returns the distinct participant relic IDs", () => {
      const ids = getIroncladParticipantRelicIds(tournaments);

      expect(ids).toContain(1188298);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("returns only the champions with a relic ID", () => {
      const championIds = getIroncladChampionRelicIds([theNewFront]);
      const champions = theNewFront.divisions
        .map((division) =>
          division.participants.find(
            (p) => p.registrationId === division.bracket?.championRegistrationId,
          ),
        )
        .map((participant) => toRelicId(participant?.relicProfileId ?? null))
        .filter((id) => id !== null);

      expect(championIds).toEqual(champions);
    });
  });
});
