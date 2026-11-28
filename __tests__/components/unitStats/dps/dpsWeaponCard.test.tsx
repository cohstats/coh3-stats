import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@testing-library/jest-dom";
import { WeaponLoadoutCardView } from "../../../../components/unit-cards/weapon-loadout-card";
import { DpsWeaponCard } from "../../../../components/unitStats/dps/dpsWeaponCard";
import { getDpsWeaponPreview } from "../../../../src/unitStats/dpsWeaponPreview";
import { calculatorMember, calculatorUnit } from "../../../test-assets/calculator-fixtures";

jest.mock("../../../../src/unitStats/dpsWeaponPreview", () => {
  const actual = jest.requireActual("../../../../src/unitStats/dpsWeaponPreview");
  return { ...actual, getDpsWeaponPreview: jest.fn(actual.getDpsWeaponPreview) };
});
jest.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { datasets: { data: { x: number; y: number }[] }[] } }) => (
    <output data-testid="hover-curve">{JSON.stringify(data.datasets[0].data)}</output>
  ),
}));
jest.mock("next-i18next/pages", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

let root: Root;
let container: HTMLDivElement;
beforeAll(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
});
beforeEach(() => {
  jest.mocked(getDpsWeaponPreview).mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

it("scales single-shot suppression before rounding and keeps three decimals for setup timings", async () => {
  const { weapon } = calculatorMember({
    aoe_outer_radius: 0,
    deflection_has_deflection_damage: true,
    deflection_damage_multiplier: 0.123456,
    suppression_amount: 0.000476,
    setup_time: 1.23456,
    teardown_time: 2.34567,
  });
  await act(async () =>
    root.render(
      <MantineProvider env="test">
        <WeaponLoadoutCardView
          weapon={{ ...weapon, weapon_class: "cannon" }}
          context={{ source: "ability", abilityNumShots: 1 }}
        />
      </MantineProvider>,
    ),
  );

  expect(container).toHaveTextContent("weaponCard.deflectionDamage12.35");
  expect(container).toHaveTextContent("weaponCard.suppression0.05");
  expect(container).toHaveTextContent("weaponCard.setup1.235s");
  expect(container).toHaveTextContent("weaponCard.teardown2.346s");
});

it("prepares only an open hover and refreshes its stats and curve after in-place unit edits", async () => {
  const member = {
    ...calculatorMember({
      aoe_outer_radius: 0,
      accuracy_far: 0.05,
      deflection_has_deflection_damage: false,
    }),
    image: "/gun.png",
    label: "Gun",
  };
  member.weapon.weapon_class = "cannon";
  member.weapon.icon_name = "";
  const unit = calculatorUnit({ cover: "", weapon_member: [member] });
  unit.custom_modifiers!.damage = { type: "percentage", value: 20, enabled: true };
  unit.custom_modifiers!.accuracy = { type: "percentage", value: 100, enabled: true };
  const render = async () => {
    await act(async () =>
      root.render(
        <MantineProvider env="test">
          <DpsWeaponCard
            unit={unit}
            weapon_member={unit.weapon_member[0]}
            onNumberChange={() => {}}
            onDeleteMember={() => {}}
          />
        </MantineProvider>,
      ),
    );
  };
  await render();
  expect(getDpsWeaponPreview).not.toHaveBeenCalled();
  await act(async () => {
    container.querySelector("img")!.parentElement!.dispatchEvent(new MouseEvent("mouseenter"));
  });
  const deadline = Date.now() + 2000;
  while (!document.querySelector('[data-testid="hover-curve"]')) {
    if (Date.now() > deadline) throw new Error("Weapon hover did not open");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  const stat = (label: string) =>
    Array.from(document.querySelectorAll("p")).find((p) => p.textContent === label);
  expect(stat("weaponCard.damage")?.parentElement).toHaveTextContent("120");
  const tankRow = () => stat("weaponCard.accuracyVsTanks")?.closest(".mantine-Grid-root");
  // A 5% base gun boosted to 10% still shows 200% against target size 20.
  expect(tankRow()).toHaveTextContent(/200%$/);
  const firstCurve = document.querySelector('[data-testid="hover-curve"]')!.textContent;
  unit.custom_modifiers!.damage.value = 50;
  unit.custom_modifiers!.accuracy = { type: "absolute", value: 0.12, enabled: true };
  await render();
  expect(stat("weaponCard.damage")?.parentElement).toHaveTextContent("150");
  expect(tankRow()).toHaveTextContent(/12%$/);
  expect(document.querySelector('[data-testid="hover-curve"]')!.textContent).not.toBe(firstCurve);
  expect(member.weapon.weapon_bag.damage_max).toBe(100);

  // Switching to a gun with exactly 8% base accuracy keeps a single row, even at 4% effective.
  unit.weapon_member = [
    {
      ...member,
      weapon: {
        ...member.weapon,
        weapon_bag: { ...member.weapon.weapon_bag, accuracy_far: 0.08 },
      },
    },
  ];
  unit.custom_modifiers!.accuracy = { type: "percentage", value: -50, enabled: true };
  await render();
  expect(tankRow()).toBeUndefined();
  expect(stat("weaponCard.accuracy")?.closest(".mantine-Grid-root")).toHaveTextContent(/4%$/);
});
