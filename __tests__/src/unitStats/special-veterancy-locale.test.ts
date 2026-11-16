import config from "../../../config";
import { fetchJsonWithLogging } from "../../../src/unitStats/fetch-mappings-withLogs";
import { setLocstring } from "../../../src/unitStats/locstring";
import { getSbpsStats } from "../../../src/unitStats/mappingSbps";
import { extractSpecialVeterancyModifiers } from "../../../src/unitStats/specialVeterancy";

jest.mock("../../../src/unitStats/fetch-mappings-withLogs", () => ({
  fetchJsonWithLogging: jest.fn(),
}));

it.each([
  ["main_gun_accuracy", "+15% main gun accuracy", 1.15],
  ["main_gun_grant_accuracy", "+15% cannon accuracy", 1.15],
  ["MAIN_GUN_FUTURE_TANK_ACCURACY_BONUS", "+25% main gun accuracy", 1.25],
  ["main_gun_panzer_iv", "+20% main gun accuracy", 1.2],
  ["tiger_main_gun", "+30% rotation rate; +20% rate of fire; +100% main gun accuracy", 2],
] as const)("recognizes the main-gun accuracy payload %s", (tree, text, multiplier) => {
  expect(extractSpecialVeterancyModifiers(`custom_payloads\\offensive\\${tree}`, text)).toEqual([
    { id: "WEAPON_MAIN_GUN_ACCURACY_MODIFIER", value: multiplier },
  ]);
});

it("requires an accuracy amount and a matching payload", () => {
  expect(
    extractSpecialVeterancyModifiers("main_gun_future_accuracy", "+20% rotation rate"),
  ).toEqual([]);
  expect(extractSpecialVeterancyModifiers("turret_accuracy", "+20% accuracy")).toEqual([]);
});

const reference = (value: string) => ({ locstring: { name: "", value } });
const rank = (tree: string, text: string, formatter?: any) => ({
  veterancy_rank: {
    veterancy_value: 100,
    brief_text: reference(text),
    brief_text_formatter: formatter,
    state_tree_references: {
      squad_entity_action_tree: { ActionTree_OpeningBranch: tree },
    },
  },
});
const squad = (ranks: any[]) => ({
  extensions: [
    {
      squadexts: {
        template_reference: { value: "sbpextensions\\squad_veterancy_ext" },
        race_list: [{ race_data: { info: { veterancy_rank_info: ranks } } }],
      },
    },
  ],
});

const english = {
  accuracy: "+15% main gun accuracy",
  mg: "+33% machine gun damage",
  vehicle: "+40 damage against vehicles",
  croc: "+%1%%% %2% \\n+%3:.2% %4%",
  rate: "rate of fire",
  flame: "flamethrower damage",
};
const german = {
  accuracy: "+99% Genauigkeit des Hauptgeschützes",
  mg: "+99% MG-Schaden",
  vehicle: "+99 Schaden gegen Fahrzeuge",
  croc: "+%1%%% %2% \\n+%3:.2% %4%",
  rate: "Feuerrate",
  flame: "Flammenwerfer-Schaden",
};
const root = {
  races: {
    american: {
      vehicles: {
        sherman_fixture: squad([
          rank("custom_payloads/offensive/main_gun_accuracy", "accuracy"),
          undefined,
          rank("custom_payloads/offensive/sherman_mg_buff", "mg"),
        ]),
        croc_fixture: squad([
          undefined,
          rank("custom_payloads/offensive/croc_flamethrower_damage", "croc", {
            formatter: reference("croc"),
            formatter_arguments: [
              { int_value: 20 },
              { locstring_value: reference("rate") },
              { float_value: 0.75 },
              { locstring_value: reference("flame") },
            ],
          }),
        ]),
        vehicle_fixture: squad([rank("", "vehicle")]),
      },
    },
  },
};

it("extracts bonuses from canonical English metadata while keeping translated descriptions", async () => {
  const fetchJson = jest.mocked(fetchJsonWithLogging);
  fetchJson.mockImplementation(async (url) => {
    if (url === config.getPatchDataUrl("sbps.json")) return root;
    if (url === config.getPatchDataUrl("veterancy.json")) return {};
    if (url === config.getPatchDataLocaleUrl("en")) return english;
    throw new Error(`Unexpected metadata request: ${url}`);
  });
  // The DPS pages historically seed the default display cache from their
  // localized props. Neither that cache nor the chosen language may affect stats.
  setLocstring(german, "en");
  setLocstring(german, "de");
  const translated = await getSbpsStats("latest", "de");
  setLocstring(english, "en");
  const original = await getSbpsStats("latest", "en");

  for (const unit of translated) {
    const equivalent = original.find(({ id }) => id === unit.id)!;
    for (const level of ["one", "two", "three"] as const) {
      expect(unit.veterancyInfo[level].modifiers).toEqual(
        equivalent.veterancyInfo[level].modifiers,
      );
    }
  }
  const sherman = translated.find(({ id }) => id === "sherman_fixture")!;
  expect(sherman.veterancyInfo.one.screenName).toBe(german.accuracy);
  expect(sherman.veterancyInfo.one.modifiers).toEqual([
    { id: "WEAPON_MAIN_GUN_ACCURACY_MODIFIER", value: 1.15 },
  ]);
  expect(sherman.veterancyInfo.three.modifiers).toEqual([
    { id: "WEAPON_MG_DAMAGE_MODIFIER", value: 1.33 },
  ]);
  expect(translated.find(({ id }) => id === "croc_fixture")!.veterancyInfo.two.modifiers).toEqual(
    [{ id: "WEAPON_FLAMETHROWER_DAMAGE_ADDITION", value: 0.75 }],
  );
  expect(translated.find(({ id }) => id === "croc_fixture")!.veterancyInfo.two.screenName).toBe(
    "+20% Feuerrate \\n+0.75 Flammenwerfer-Schaden",
  );
  expect(
    translated.find(({ id }) => id === "vehicle_fixture")!.veterancyInfo.one.modifiers,
  ).toEqual([{ id: "WEAPON_DAMAGE_VS_VEHICLES_ADDITION", value: 40 }]);
  // Both display locales share one canonical request for the selected patch.
  expect(
    fetchJson.mock.calls.filter(([url]) => url === config.getPatchDataLocaleUrl("en")),
  ).toHaveLength(1);
});
