import { fetchJsonWithLogging } from "../../../src/unitStats/fetch-mappings-withLogs";
import { getEbpsStats, type EbpsType } from "../../../src/unitStats/mappingEbps";
import type { SbpsType } from "../../../src/unitStats/mappingSbps";
import type { WeaponType } from "../../../src/unitStats/mappingWeapon";
import {
  getSbpsWeapons,
  getUnitModelCount,
  updateHealth,
  type CustomizableUnit,
} from "../../../src/unitStats/dpsCommon";

jest.mock("../../../src/unitStats/fetch-mappings-withLogs", () => ({
  fetchJsonWithLogging: jest.fn(),
}));
jest.mock("../../../src/unitStats/weaponLib", () => ({
  getSingleWeaponDPS: () => 0,
}));

const cases = [
  { id: "hmg", type: "tp_carried", minimum: 1, humans: 4 },
  { id: "mortar", type: "tp_carried", minimum: 2, humans: 4 },
  { id: "at_gun", type: "tp_mobile", minimum: 2, humans: 5 },
];
let entities: EbpsType[];

beforeAll(async () => {
  const extension = (name: string, values: object) => ({
    exts: { template_reference: { value: `ebpextensions\\${name}` }, ...values },
  });
  jest.mocked(fetchJsonWithLogging).mockResolvedValue({
    races: {
      german: {
        team_weapons: Object.fromEntries(
          cases.map(({ id, type, minimum }) => [
            id,
            {
              extensions: [
                extension("team_weapon_ext", {
                  team_weapon_type: type,
                  role_list: Array.from({ length: minimum }, () => ({
                    role: { required: "True" },
                  })),
                }),
                extension("recrewable_ext", {
                  race_list: [{ race_data: { info: { min_capture_crew_size: minimum } } }],
                }),
                extension("weapon_ext", { weapon: { instance_reference: `weapons/${id}` } }),
              ],
            },
          ]),
        ),
      },
    },
  });
  entities = await getEbpsStats();
});

it.each(cases)(
  "reserves two non-firing crew for $id while preserving squad HP",
  ({ id, minimum, humans }) => {
    const teamWeapon = entities.find((entity) => entity.id === id)!;
    expect(teamWeapon.teamWeapon?.requiredCrew).toBe(minimum);
    const sidearm: EbpsType = {
      ...teamWeapon,
      id: "sidearm",
      crew_size: 0,
      teamWeapon: undefined,
      weaponId: "sidearm",
    };
    const crew: EbpsType = {
      ...sidearm,
      id: "crew",
      weaponId: "",
      weaponRef: [
        {
          ebp: "weapons/sidearm",
          hardpointIndex: 0,
          type: "weapon",
          initializeWeaponsOnCreation: true,
          receivesAttackCommands: true,
        },
      ],
    };
    const squad = {
      unitType: "team_weapons",
      loadout: [
        { type: `weapons/${id}`, num: 1 },
        { type: "infantry/crew", num: humans },
      ],
    } as SbpsType;
    const weapons = [id, "sidearm"].map(
      (weaponId) =>
        ({
          id: weaponId,
          icon_name: "",
          parent: "rifle",
          weapon_bag: { damage_max: 1, range: { max: 0 } },
        }) as WeaponType,
    );
    const members = getSbpsWeapons(squad, [...entities, crew, sidearm], weapons);

    expect(members.map(({ weapon_id, num }) => ({ weapon_id, num }))).toEqual([
      { weapon_id: id, num: 1 },
      { weapon_id: "sidearm", num: humans - 2 },
    ]);
    const unit = {
      unit_type: "team_weapons",
      weapon_member: members,
      hitpoints: 80,
    } as CustomizableUnit;
    expect(getUnitModelCount(unit)).toBe(humans);
    updateHealth(unit);
    expect(unit.health).toBe(humans * 80);
  },
);
