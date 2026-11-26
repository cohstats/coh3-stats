import config from "../../../config";
import {
  clearIngameTipsCache,
  filterIngameTips,
  FINAL_STAND_TIPS_GAME_MODE,
  filterIngameTipsForUnit,
  getIngameTipById,
  isEngineerUnit,
  getIngameTips,
  groupIngameTipsByTopic,
  parseIngameTips,
  pickIngameTip,
} from "../../../src/explorer/ingame-tips";
import type { RawIngameTipsFile } from "../../../src/explorer/ingame-tips";
import { getLocstringForPatch } from "../../../src/explorer/patch-locstring";
import { fetchJsonWithLogging } from "../../../src/unitStats/fetch-mappings-withLogs";

jest.mock("../../../src/unitStats/fetch-mappings-withLogs", () => ({
  fetchJsonWithLogging: jest.fn(),
}));

jest.mock("../../../src/explorer/patch-locstring", () => ({
  ...jest.requireActual("../../../src/explorer/patch-locstring"),
  getLocstringForPatch: jest.fn(),
}));

const fetchJson = jest.mocked(fetchJsonWithLogging);
const getLocstring = jest.mocked(getLocstringForPatch);

const rawFile: RawIngameTipsFile = {
  tips: [
    {
      id: "hoff_tipperks1",
      path: "load_tips/hoff/hoff_tipperks1",
      pbgid: 2174329,
      locstring: "11317065",
      category: "perks",
      topic: "final_stand",
      gameMode: "hoff",
    },
    {
      id: "tipcover1",
      path: "load_tips/tipcover1",
      pbgid: 199487,
      locstring: "11182582",
      category: "cover",
      topic: "combat",
      gameMode: null,
    },
    {
      id: "tipengineer1",
      path: "load_tips/tipengineer1",
      pbgid: 2117205,
      locstring: "11244179",
      category: "engineer",
      topic: "engineering",
      gameMode: null,
    },
    // No text in the locstring file - dropped.
    {
      id: "tipmissing",
      path: "load_tips/tipmissing",
      pbgid: 1,
      locstring: "99999999",
      category: "cover",
      topic: "combat",
      gameMode: null,
    },
  ],
};

const english = {
  "11317065": "You gain Perk Points for earning medals.",
  "11182582": "Use cover.\\nIt helps.",
  "11244179": "Engineers can build.",
  "99999999": null,
};
const german = { ...english, "11182582": "Nutze Deckung." };

const tipsUrl = config.getPatchDataUrl("ingame-tips.json");

const notFound = () =>
  new Error("Failed to parse JSON", {
    cause: Object.assign(new Error("404"), { response: { status: 404 } }),
  });

beforeEach(() => {
  clearIngameTipsCache();
  fetchJson.mockReset();
  getLocstring.mockReset();
  getLocstring.mockImplementation(async (_patch, locale) => (locale === "de" ? german : english));
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => jest.restoreAllMocks());

describe("parseIngameTips", () => {
  test("resolves the texts, drops tips without one and the blueprint path", () => {
    const tips = parseIngameTips(rawFile, english);

    expect(tips.map((tip) => tip.id)).toEqual(["hoff_tipperks1", "tipcover1", "tipengineer1"]);
    expect(tips[1]).toEqual({
      id: "tipcover1",
      pbgid: 199487,
      text: "Use cover.\nIt helps.",
      category: "cover",
      topic: "combat",
      gameMode: null,
    });
  });

  test("skips malformed and duplicate entries", () => {
    const tips = parseIngameTips(
      { tips: [rawFile.tips[1], null as any, { id: 5 } as any, rawFile.tips[1]] },
      english,
    );
    expect(tips.map((tip) => tip.id)).toEqual(["tipcover1"]);
  });
});

describe("getIngameTips", () => {
  test("downloads the file once for all locales and resolves each locale", async () => {
    fetchJson.mockResolvedValue(rawFile);

    const [en, de, enAgain] = await Promise.all([
      getIngameTips({ locale: "en" }),
      getIngameTips({ locale: "de" }),
      getIngameTips({ locale: "en", patch: config.latestPatch }),
    ]);

    expect(fetchJson).toHaveBeenCalledTimes(1);
    expect(fetchJson).toHaveBeenCalledWith(tipsUrl, expect.any(String));
    expect(en?.tips[1].text).toBe("Use cover.\nIt helps.");
    expect(de?.tips[1].text).toBe("Nutze Deckung.");
    expect(de?.locale).toBe("de");
    // The explicit latest patch shares the cache of "latest".
    expect(enAgain).toBe(en);
  });

  test("returns null for a data tag without the file and remembers it", async () => {
    fetchJson.mockRejectedValue(notFound());

    expect(await getIngameTips({ locale: "en" })).toBeNull();
    expect(await getIngameTips({ locale: "de" })).toBeNull();
    expect(fetchJson).toHaveBeenCalledTimes(1);
    // No point in downloading the heavy locstring file for a missing tips file.
    expect(getLocstring).not.toHaveBeenCalled();
  });

  test("retries after a transient failure", async () => {
    fetchJson.mockRejectedValueOnce(new Error("ECONNRESET")).mockResolvedValue(rawFile);

    expect(await getIngameTips()).toBeNull();
    expect((await getIngameTips())?.tips).toHaveLength(3);
    expect(fetchJson).toHaveBeenCalledTimes(2);
  });

  test("returns null for an unknown patch without downloading", async () => {
    expect(await getIngameTips({ patch: "0.0.0-does-not-exist" })).toBeNull();
    expect(fetchJson).not.toHaveBeenCalled();
  });

  test("returns null for an unexpected file content and retries later", async () => {
    fetchJson.mockResolvedValueOnce({ something: "else" }).mockResolvedValue(rawFile);
    expect(await getIngameTips()).toBeNull();
    expect((await getIngameTips())?.tips).toHaveLength(3);
    expect(fetchJson).toHaveBeenCalledTimes(2);
  });
});

describe("helpers", () => {
  const tips = parseIngameTips(rawFile, english);

  test("filterIngameTips", () => {
    expect(filterIngameTips(tips, { gameMode: null }).map((tip) => tip.id)).toEqual([
      "tipcover1",
      "tipengineer1",
    ]);
    expect(
      filterIngameTips(tips, { gameMode: FINAL_STAND_TIPS_GAME_MODE }).map((tip) => tip.id),
    ).toEqual(["hoff_tipperks1"]);
    expect(
      filterIngameTips(tips, { gameMode: FINAL_STAND_TIPS_GAME_MODE, includeGeneric: true }),
    ).toHaveLength(3);
    expect(filterIngameTips(tips, { topics: ["engineering"] }).map((tip) => tip.id)).toEqual([
      "tipengineer1",
    ]);
    expect(filterIngameTips(null)).toEqual([]);
  });

  test("groupIngameTipsByTopic keeps the file order", () => {
    expect(Object.keys(groupIngameTipsByTopic(tips))).toEqual([
      "final_stand",
      "combat",
      "engineering",
    ]);
  });

  test("pickIngameTip is stable for a seed", () => {
    expect(pickIngameTip([], 3)).toBeNull();
    expect(pickIngameTip(tips, 4)?.id).toBe("tipcover1");
    expect(pickIngameTip(tips, -1)?.id).toBe("tipengineer1");
    expect(tips).toContain(pickIngameTip(tips));
  });

  test("getIngameTipById", () => {
    const data = { tips, patch: "latest", locale: "en" };
    expect(getIngameTipById(data, "tipengineer1")?.text).toBe("Engineers can build.");
    expect(getIngameTipById(data, "nope")).toBeNull();
  });
});

describe("filterIngameTipsForUnit", () => {
  const tip = (id: string, category: string, gameMode: string | null = null) => ({
    id,
    text: id,
    category,
    gameMode,
  });
  const tips = [
    tip("tipcover1", "cover"),
    tip("tipcover9", "cover"), // tanks crushing cover - vehicles only
    tip("tiparmor1", "armor"),
    tip("tipengineer1", "engineer"),
    tip("tipcontrols1", "controls"), // not about a kind of unit
    tip("tipnew1", "some_new_category"), // unmapped
    tip("hoff_tipperks1", "perks", "hoff"),
  ];
  const ids = (unit: Parameters<typeof filterIngameTipsForUnit>[1]) =>
    filterIngameTipsForUnit(tips, unit).map((x) => x.id);

  test("infantry gets infantry tips only", () => {
    expect(ids({ unitType: "infantry" })).toEqual(["tipcover1"]);
  });

  test("engineers also get the engineering tips", () => {
    expect(ids({ unitType: "infantry", isEngineer: true })).toEqual([
      "tipcover1",
      "tipengineer1",
    ]);
  });

  test("vehicles get the vehicle tips and the per-tip overrides", () => {
    expect(ids({ unitType: "vehicles" })).toEqual(["tipcover9", "tiparmor1"]);
  });

  test("isEngineerUnit - infantry which can repair", () => {
    expect(isEngineerUnit("infantry", ["repair_pioneer_ger", "cut_wire_engineer_us"])).toBe(true);
    // Grenadiers build sandbags and wire, but are no engineers.
    expect(isEngineerUnit("infantry", ["grenade_ger"])).toBe(false);
    expect(isEngineerUnit("vehicles", ["repair_recovery_vehicle"])).toBe(false);
  });

  test("unknown unit types get nothing", () => {
    expect(ids({ unitType: "aircraft" })).toEqual([]);
  });
});
