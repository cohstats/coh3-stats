/** @jest-environment node */

import config from "../../../config";
import fixture from "../../test-assets/formation-fixtures.json";
import { getDpsData } from "../../../src/unitStats/dpsData.server";
import { fetchJsonWithLogging } from "../../../src/unitStats/fetch-mappings-withLogs";

jest.mock("../../../src/unitStats/fetch-mappings-withLogs", () => ({
  fetchJsonWithLogging: jest.fn(),
}));
jest.mock("../../../src/unitStats/mappingWeapon", () => ({ getWeaponStats: async () => [] }));
jest.mock("../../../src/unitStats/mappingEbps", () => ({ getEbpsStats: async () => [] }));
jest.mock("../../../src/unitStats/mappingUpgrades", () => ({ getUpgradesStats: async () => [] }));
jest.mock("../../../src/unitStats/mappingAbilities", () => ({
  getAbilitiesStats: async () => [],
}));

const fetchJson = jest.mocked(fetchJsonWithLogging);
const oldPatches = Object.keys(config.patches).filter((patch) => patch !== config.latestPatch);
const english = { accuracy: "+15% main gun accuracy" };
const squads = {
  races: {
    american: {
      vehicles: {
        sherman_fixture: {
          extensions: [
            {
              squadexts: {
                template_reference: { value: "sbpextensions\\squad_veterancy_ext" },
                race_list: [
                  {
                    race_data: {
                      info: {
                        veterancy_rank_info: [
                          {
                            veterancy_rank: {
                              veterancy_value: 100,
                              brief_text: { locstring: { value: "accuracy" } },
                              state_tree_references: {
                                squad_entity_action_tree: {
                                  ActionTree_OpeningBranch: "main_gun_accuracy",
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};

const missing = () => new Error("Missing file", { cause: { response: { status: 404 } } });

const loadNormally = async (url: string) => {
  if (url.endsWith("/sbps.json")) return squads;
  if (url.endsWith("/en-locstring.json")) return english;
  if (url.endsWith("/squad_formations.json")) return fixture.squadFormations;
  if (url.endsWith("/formations.json")) return fixture.formations;
  if (url.endsWith("/veterancy.json")) return {};
  throw new Error(`Unexpected request: ${url}`);
};

beforeEach(() => {
  fetchJson.mockReset();
});

it("retries temporary formation failures through both the formation and aggregate caches", async () => {
  const patch = oldPatches[0];
  let available = false;
  fetchJson.mockImplementation(async (url) => {
    if (url === config.getPatchDataUrl("formations.json", patch) && !available)
      throw new Error("Temporary formation failure");
    return loadNormally(url);
  });

  await expect(getDpsData(patch)).rejects.toThrow("Temporary formation failure");
  available = true;
  const recovered = await getDpsData(patch);
  expect(Object.keys(recovered.formationData).length).toBeGreaterThan(0);
  expect(await getDpsData(patch)).toBe(recovered);
  expect(
    fetchJson.mock.calls.filter(
      ([url]) => url === config.getPatchDataUrl("formations.json", patch),
    ),
  ).toHaveLength(2);
});

it("retains and caches the old-patch fallback for formation files that do not exist", async () => {
  const patch = oldPatches[1];
  fetchJson.mockImplementation(async (url) => {
    if (url === config.getPatchDataUrl("formations.json", patch)) throw missing();
    return loadNormally(url);
  });
  const data = await getDpsData(patch);
  expect(data.formationData).toEqual({});
  expect(data.sbpsData).toHaveLength(1);
  const calls = fetchJson.mock.calls.length;
  expect(await getDpsData(patch)).toBe(data);
  expect(fetchJson).toHaveBeenCalledTimes(calls);
});

it("retries English numeric metadata instead of caching an incomplete DPS response", async () => {
  const patch = oldPatches[2];
  let available = false;
  fetchJson.mockImplementation(async (url) => {
    if (url === config.getPatchDataLocaleUrl("en", patch) && !available)
      throw new Error("Temporary English metadata failure");
    return loadNormally(url);
  });
  await expect(getDpsData(patch)).rejects.toThrow("Temporary English metadata failure");
  available = true;
  const recovered = await getDpsData(patch);
  expect(recovered.sbpsData[0].veterancyInfo.one.modifiers).toEqual([
    { id: "WEAPON_MAIN_GUN_ACCURACY_MODIFIER", value: 1.15 },
  ]);
  expect(await getDpsData(patch)).toBe(recovered);
});

it("also retries a temporary failure of the optional latest-patch veterancy file", async () => {
  let available = false;
  fetchJson.mockImplementation(async (url) => {
    if (url.endsWith("/veterancy.json") && !available)
      throw new Error("Temporary veterancy failure");
    return loadNormally(url);
  });
  await expect(getDpsData()).rejects.toThrow("Temporary veterancy failure");
  available = true;
  const recovered = await getDpsData();
  expect(recovered.sbpsData[0].veterancyInfo.one.modifiers).toHaveLength(1);
  expect(await getDpsData()).toBe(recovered);
});
