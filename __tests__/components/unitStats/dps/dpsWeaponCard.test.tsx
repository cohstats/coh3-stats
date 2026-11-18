import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@testing-library/jest-dom";
import { DpsWeaponCard } from "../../../../components/unitStats/dps/dpsWeaponCard";
import { getDpsWeaponPreview } from "../../../../src/unitStats/dpsWeaponPreview";
import { calculatorMember, calculatorUnit } from "../../../test-assets/calculator-fixtures";
import type { WeaponType } from "../../../../src/unitStats/mappingWeapon";

jest.mock("../../../../src/unitStats/dpsWeaponPreview", () => {
  const actual = jest.requireActual("../../../../src/unitStats/dpsWeaponPreview");
  return { ...actual, getDpsWeaponPreview: jest.fn(actual.getDpsWeaponPreview) };
});
jest.mock("../../../../components/unit-cards/weapon-loadout-card", () => ({
  WeaponLoadoutCardView: ({ weapon }: { weapon: WeaponType }) => (
    <output data-testid="hover-stats">{JSON.stringify(weapon.weapon_bag)}</output>
  ),
}));
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

it("prepares only an open hover and refreshes its stats and curve after in-place unit edits", async () => {
  const member = {
    ...calculatorMember({ aoe_outer_radius: 0 }),
    image: "/gun.png",
    label: "Gun",
  };
  const unit = calculatorUnit({ cover: "", weapon_member: [member] });
  unit.custom_modifiers!.damage = { type: "percentage", value: 20, enabled: true };
  const render = async () => {
    await act(async () =>
      root.render(
        <MantineProvider env="test">
          <DpsWeaponCard
            unit={unit}
            weapon_member={member}
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
  while (!document.querySelector('[data-testid="hover-stats"]')) {
    if (Date.now() > deadline) throw new Error("Weapon hover did not open");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  const stats = () =>
    JSON.parse(document.querySelector('[data-testid="hover-stats"]')!.textContent!);
  expect(stats().damage_max).toBe(120);
  const firstCurve = document.querySelector('[data-testid="hover-curve"]')!.textContent;
  unit.custom_modifiers!.damage.value = 50;
  await render();
  expect(stats().damage_max).toBe(150);
  expect(document.querySelector('[data-testid="hover-curve"]')!.textContent).not.toBe(firstCurve);
  expect(member.weapon.weapon_bag.damage_max).toBe(100);
});
