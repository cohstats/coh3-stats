import { updateHealth, createDefaultCustomModifiers } from "../../../src/unitStats/dpsCommon";
import type { CustomizableUnit } from "../../../src/unitStats/dpsCommon";

describe("Hit Points Modifier", () => {
  const createMockUnit = (baseHitpoints: number = 80): CustomizableUnit => ({
    id: "test_unit",
    screen_name: "Test Unit",
    path: "test/path",
    faction: "test",
    weapon_member: [
      {
        weapon_id: "test_weapon",
        weapon: {} as any,
        num: 4,
        crew_size: 1,
        image: "",
        dps_default: [],
      },
    ],
    def_weapon_member: [],
    unit_type: "infantry",
    help_text: "Test unit",
    icon_name: "test_icon",
    faction_icon: "test_faction_icon",
    cover: "",
    is_moving: false,
    hitpoints: baseHitpoints,
    type_icon: "",
    target_size: 1,
    armor: 1,
    value: "test_unit",
    label: "Test Unit",
    image: "",
    description: "Test unit",
    health: 0, // Will be calculated by updateHealth
    def_member: "",
    def_damage_type: "",
    sbps: {} as any,
    ebps_default: {} as any,
    dps_preview: [],
    cost_mp: 0,
    cost_fuel: 0,
    cost_reinforce: 0,
    cost_pop: 0,
    upkeep_mp: 0,
    sight_range: 0,
    range: 0,
    penetration: 0,
    dps_n: 0,
    dps_m: 0,
    dps_f: 0,
    capture_rate: 0,
    capture_revert: 0,
    speed: 0,
    custom_modifiers: createDefaultCustomModifiers(),
  });

  it("should calculate health without modifiers", () => {
    const unit = createMockUnit(80);
    updateHealth(unit);

    // Infantry: hitpoints * num * crew_size = 80 * 4 * 1 = 320
    expect(unit.health).toBe(320);
  });

  it("should apply percentage hit points modifier", () => {
    const unit = createMockUnit(80);
    unit.custom_modifiers!.hitpoints = {
      type: "percentage",
      value: 50, // +50%
      enabled: true,
    };

    updateHealth(unit);

    // Modified hitpoints: 80 * 1.5 = 120
    // Total health: 120 * 4 * 1 = 480
    expect(unit.health).toBe(480);
  });

  it("should apply negative percentage hit points modifier", () => {
    const unit = createMockUnit(80);
    unit.custom_modifiers!.hitpoints = {
      type: "percentage",
      value: -25, // -25%
      enabled: true,
    };

    updateHealth(unit);

    // Modified hitpoints: 80 * 0.75 = 60
    // Total health: 60 * 4 * 1 = 240
    expect(unit.health).toBe(240);
  });

  it("should apply absolute hit points modifier", () => {
    const unit = createMockUnit(80);
    unit.custom_modifiers!.hitpoints = {
      type: "absolute",
      value: 100,
      enabled: true,
    };

    updateHealth(unit);

    // Absolute hitpoints: 100
    // Total health: 100 * 4 * 1 = 400
    expect(unit.health).toBe(400);
  });

  it("should enforce minimum 1 HP", () => {
    const unit = createMockUnit(80);
    unit.custom_modifiers!.hitpoints = {
      type: "percentage",
      value: -100, // -100% would result in 0 HP
      enabled: true,
    };

    updateHealth(unit);

    // Should be clamped to minimum 1 HP per entity
    // Total health: 1 * 4 * 1 = 4
    expect(unit.health).toBe(4);
  });

  it("should handle vehicles correctly", () => {
    const unit = createMockUnit(200);
    unit.unit_type = "vehicles";
    unit.custom_modifiers!.hitpoints = {
      type: "percentage",
      value: 25, // +25%
      enabled: true,
    };

    updateHealth(unit);

    // Modified hitpoints: 200 * 1.25 = 250
    // Vehicles don't multiply by weapon_member count
    expect(unit.health).toBe(250);
  });

  it("should not apply modifier when disabled", () => {
    const unit = createMockUnit(80);
    unit.custom_modifiers!.hitpoints = {
      type: "percentage",
      value: 50,
      enabled: false, // Disabled
    };

    updateHealth(unit);

    // Should use base hitpoints: 80 * 4 * 1 = 320
    expect(unit.health).toBe(320);
  });
});
