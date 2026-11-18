import React, { act, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import {
  CustomConfigModal,
  type CustomModifierScope,
} from "../../../../components/unitStats/dps/CustomConfigModal";
import {
  DEFAULT_SCATTER_FORMATION,
  ScatterFormationEditor,
} from "../../../../components/unitStats/dps/components/ScatterFormationEditor";
import {
  createDefaultCustomModifiers,
  type CustomizableUnit,
} from "../../../../src/unitStats/dpsCommon";
import { getDirectionalCoverLine } from "../../../../src/unitStats/squadFormations";

jest.mock("next-i18next/pages", () => {
  const translations = jest.requireActual("../../../../public/locales/en/explorer.json");
  return {
    useTranslation: () => ({
      t: (key: string, values: Record<string, string | number> = {}) => {
        const text = key.split(".").reduce((value: any, part) => value?.[part], translations);
        return typeof text === "string"
          ? text.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => String(values[name] ?? name))
          : key;
      },
    }),
  };
});

let container: HTMLDivElement;
let root: Root;

beforeAll(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
  window.matchMedia = jest.fn().mockImplementation((media: string) => ({
    matches: false,
    media,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
});

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const render = async (element: React.ReactNode) => {
  await act(async () =>
    root.render(
      <MantineProvider
        env="test"
        // These tests exercise badges and controls, not floating layout for closed dropdowns.
        theme={{ components: { Combobox: { defaultProps: { keepMounted: false } } } }}
      >
        {element}
      </MantineProvider>,
    ),
  );
};

const models = [
  { id: 1, x: 2, y: 3, enabled: true },
  { id: 2, x: -1, y: 0, enabled: true },
];

const Formation = () => {
  const [value, setValue] = useState({
    ...DEFAULT_SCATTER_FORMATION,
    disabledModelIds: [] as number[],
  });
  return (
    <>
      <ScatterFormationEditor
        value={value}
        models={models.map((model) => ({
          ...model,
          enabled: !value.disabledModelIds.includes(model.id),
        }))}
        coverLine={
          value.formation === "cover" && value.directionalCover
            ? getDirectionalCoverLine(models)
            : undefined
        }
        onChange={setValue}
        previewWeaponOptions={[]}
        selectedPreviewWeaponId={null}
        onPreviewWeaponChange={() => {}}
        onPreviewRangeChange={() => {}}
      />
      <output data-testid="formation-state">{JSON.stringify(value)}</output>
    </>
  );
};

const state = () =>
  JSON.parse(container.querySelector('[data-testid="formation-state"]')!.textContent!);
const key = async (element: HTMLElement, name: string, shiftKey = false) => {
  await act(async () => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: name, shiftKey, bubbles: true, cancelable: true }),
    );
  });
};
const changeInput = async (input: HTMLInputElement, value: string) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

it("shows combined percentage totals while leaving the saved manual modifiers unchanged", async () => {
  const modifiers = createDefaultCustomModifiers();
  for (const key of ["accuracy", "damage", "overallAttackSpeed", "receivedAccuracy"] as const)
    modifiers[key] = { type: "percentage", value: 20, enabled: true };
  const unit = {
    veterancyLevel: 1,
    sbps: {
      veterancyInfo: {
        one: {
          exp: 100,
          modifiers: [
            { id: "WEAPON_ACCURACY_MODIFIER", value: 1.2 },
            { id: "WEAPON_DAMAGE_MODIFIER", value: 1.2 },
            { id: "WEAPON_OVERALL_ATTACK_SPEED", value: 0.8 },
            { id: "RECEIVED_ACCURACY_MODIFIER", value: 0.8 },
          ],
        },
      },
    },
  } as unknown as CustomizableUnit;
  const onChange = jest.fn();
  await render(
    <CustomConfigModal
      opened
      onClose={() => {}}
      customModifiers={modifiers}
      unit={unit}
      onModifiersChange={onChange}
    />,
  );
  const total = (key: string) =>
    document.querySelector(`[data-testid="dps-modifier-total-${key}"]`);
  expect(total("accuracy")).toHaveTextContent("+44%");
  expect(total("damage")).toHaveTextContent("+44%");
  expect(total("overallAttackSpeed")).toHaveTextContent("+36%");
  expect(total("receivedAccuracy")).toHaveTextContent("+36%");
  expect(modifiers.damage.value).toBe(20);
  expect(onChange).not.toHaveBeenCalled();
});

it.each([
  { rank: 0, armor: 200, speed: 0.5, totalArmor: "200", totalSpeed: "0.5" },
  { rank: 1, armor: 200, speed: 0.5, totalArmor: "210", totalSpeed: "0.4" },
  { rank: 1, armor: -5, speed: -0.5, totalArmor: "10", totalSpeed: "0" },
])(
  "shows effective absolute armor $totalArmor and timing factor $totalSpeed at rank $rank",
  async ({ rank, armor, speed, totalArmor, totalSpeed }) => {
    const modifiers = createDefaultCustomModifiers();
    modifiers.armor = { type: "absolute", value: armor, enabled: true };
    modifiers.overallAttackSpeed = { type: "absolute", value: speed, enabled: true };
    const unit = {
      veterancyLevel: rank,
      sbps: {
        veterancyInfo: {
          one: {
            exp: 100,
            modifiers: [
              { id: "WEAPON_OVERALL_ATTACK_SPEED", value: 0.8 },
              { id: "FRONT_ARMOR_ADDITION", value: 10 },
            ],
          },
        },
      },
    } as unknown as CustomizableUnit;
    await render(
      <CustomConfigModal
        opened
        onClose={() => {}}
        customModifiers={modifiers}
        unit={unit}
        onModifiersChange={() => {}}
      />,
    );
    expect(document.querySelector('[data-testid="dps-modifier-total-armor"]')!.textContent).toBe(
      totalArmor,
    );
    expect(
      document.querySelector('[data-testid="dps-modifier-total-overallAttackSpeed"]')!
        .textContent,
    ).toBe(totalSpeed);
  },
);

it.each(["additive", "absolute"] as const)(
  "keeps a %s total separate from multiplicative veterancy",
  async (type) => {
    const modifiers = createDefaultCustomModifiers();
    modifiers.damage = { type, value: 10, enabled: true };
    const unit = {
      veterancyLevel: 1,
      sbps: {
        veterancyInfo: {
          one: { exp: 100, modifiers: [{ id: "WEAPON_DAMAGE_MODIFIER", value: 1.2 }] },
        },
      },
    } as unknown as CustomizableUnit;
    await render(
      <CustomConfigModal
        opened
        onClose={() => {}}
        customModifiers={modifiers}
        unit={unit}
        onModifiersChange={() => {}}
      />,
    );
    expect(document.querySelector('[data-testid="dps-modifier-total-damage"]')).toHaveTextContent(
      type === "additive" ? "+10" : "10",
    );
  },
);

it("shows automatic bonuses with manual controls off and combines compatible flat bonuses", async () => {
  const modifiers = createDefaultCustomModifiers();
  modifiers.armor = { type: "additive", value: 5, enabled: true };
  const unit = {
    rangerFireOnMove: true,
    veterancyLevel: 1,
    sbps: {
      veterancyInfo: {
        one: {
          exp: 100,
          modifiers: [
            { id: "WEAPON_ACCURACY_MODIFIER", value: 1.2 },
            { id: "FRONT_ARMOR_ADDITION", value: 10 },
          ],
        },
      },
    },
  } as unknown as CustomizableUnit;
  await render(
    <CustomConfigModal
      opened
      onClose={() => {}}
      customModifiers={modifiers}
      unit={unit}
      onModifiersChange={() => {}}
    />,
  );
  expect(document.querySelector('[data-testid="dps-modifier-total-accuracy"]')).toHaveTextContent(
    "+44%",
  );
  expect(document.querySelector('[data-testid="dps-modifier-total-armor"]')).toHaveTextContent(
    "+15",
  );
  expect(modifiers.accuracy.enabled).toBe(false);
});

it("enters ground attack from the keyboard and moves the aim in coarse and fine steps", async () => {
  await render(<Formation />);
  const diagram = container.querySelector<HTMLElement>(
    '[role="group"][aria-label="Infantry formation and aiming"]',
  )!;
  expect(diagram).toHaveAttribute("tabindex", "0");
  expect(diagram).toHaveAccessibleDescription(/Arrow keys/);
  await key(diagram, "Enter");
  expect(state()).toMatchObject({ targetModelId: null, groundTarget: { x: 2, y: 3 } });
  await key(diagram, "ArrowRight");
  await key(diagram, "ArrowUp", true);
  expect(state().groundTarget).toEqual({ x: 3, y: 3.1 });
  expect(container.querySelector('[data-testid="scatter-ground-aim"]')).toBeInTheDocument();
});

it("keeps model selection and keyboard toggles independent from ground-target shortcuts", async () => {
  await render(<Formation />);
  const model = container.querySelector<HTMLElement>('[data-testid="scatter-model-2"]')!;
  expect(model).toHaveAccessibleName(/Delete.*Backspace/);
  expect(model).toHaveAttribute("aria-keyshortcuts", "Delete Backspace");
  await key(model, "ArrowRight");
  expect(state().targetModelId).toBe(1);
  await act(async () => model.click());
  await key(model, "Delete");
  expect(state()).toMatchObject({ targetModelId: 2, groundTarget: null, disabledModelIds: [2] });
  await key(model, "Backspace");
  expect(state().disabledModelIds).toEqual([]);
});

it("offers Default, Cover and Bunched formations with directional cover only in Cover mode", async () => {
  await render(<Formation />);
  const button = (name: string) =>
    Array.from(container.querySelectorAll("button")).find((item) => item.textContent === name)!;
  expect(button("Default")).toHaveAttribute("aria-pressed", "true");
  expect(button("Directional cover")).toBeUndefined();
  await act(async () => button("Cover").click());
  await act(async () => button("Directional cover").click());
  expect(state()).toMatchObject({ formation: "cover", directionalCover: true });
  expect(container.querySelector('[data-testid="scatter-cover-line"]')).toBeInTheDocument();
  await act(async () => button("Bunched").click());
  expect(state().formation).toBe("bunched");
  expect(container.querySelector('[data-testid="scatter-cover-line"]')).not.toBeInTheDocument();
});

it("shows the automatic Ranger accuracy bonus without requiring a veterancy rank", async () => {
  const unit = { id: "ranger", rangerFireOnMove: true, veterancyLevel: 0 } as CustomizableUnit;
  await render(
    <CustomConfigModal
      opened
      onClose={() => {}}
      unit={unit}
      customModifiers={createDefaultCustomModifiers()}
      onModifiersChange={() => {}}
    />,
  );
  const badges = Array.from(document.querySelectorAll(".mantine-Badge-root"));
  expect(badges.filter((badge) => badge.textContent?.trim() === "★ +20%")).toHaveLength(1);
});

it.each(["all", "offensive", "defensive"] as CustomModifierScope[])(
  "shows each received-veterancy effect once in %s scope",
  async (scope) => {
    const unit = {
      id: "veteran",
      veterancyLevel: 1,
      sbps: {
        veterancyInfo: {
          one: {
            exp: 100,
            modifiers: [
              { id: "RECEIVED_ACCURACY_MODIFIER", value: 0.85 },
              { id: "RECEIVED_DAMAGE_MODIFIER", value: 0.9 },
            ],
          },
        },
      },
    } as unknown as CustomizableUnit;
    await render(
      <CustomConfigModal
        opened
        onClose={() => {}}
        customModifiers={createDefaultCustomModifiers()}
        onModifiersChange={() => {}}
        unit={unit}
        modifierScope={scope}
      />,
    );
    const badges = Array.from(document.querySelectorAll(".mantine-Badge-root"));
    const inline = scope !== "offensive";
    for (const [name, value] of [
      ["Received Accuracy Modifier", inline ? "+15%" : "0.85"],
      ["Received Damage Modifier", inline ? "+10%" : "0.9"],
    ]) {
      const matching = badges.filter((badge) =>
        inline ? badge.textContent?.trim() === `★ ${value}` : badge.textContent?.includes(name),
      );
      expect(matching).toHaveLength(1);
      expect(matching[0]).toHaveTextContent(value);
      if (inline) expect(badges.some((badge) => badge.textContent?.includes(name))).toBe(false);
    }
  },
);

it.each(["all", "defensive"] as CustomModifierScope[])(
  "edits harder-to-hit and damage-reduction bonuses in %s scope",
  async (scope) => {
    const onChange = jest.fn();
    await render(
      <CustomConfigModal
        opened
        onClose={() => {}}
        customModifiers={createDefaultCustomModifiers()}
        onModifiersChange={onChange}
        modifierScope={scope}
      />,
    );
    for (const [label, modifierKey] of [
      ["Harder to hit", "receivedAccuracy"],
      ["Damage Reduction", "receivedDamage"],
    ]) {
      const row = Array.from(document.querySelectorAll(".mantine-Card-root")).find((card) =>
        card.textContent?.includes(label),
      )!;
      expect(row).toBeInTheDocument();
      await act(async () =>
        row.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click(),
      );
      await changeInput(row.querySelector<HTMLInputElement>('input[placeholder="+%"]')!, "20");
      expect(onChange.mock.calls.at(-1)![0][modifierKey]).toMatchObject({
        enabled: true,
        type: "percentage",
        percentageValues: [20],
      });
      expect(onChange.mock.calls.at(-1)![0][modifierKey].value).toBeCloseTo(20);
      expect(row).toHaveTextContent("+20%");
      await changeInput(row.querySelector<HTMLInputElement>('input[placeholder="+%"]')!, "20");
      expect(onChange.mock.calls.at(-1)![0][modifierKey].value).toBeCloseTo(36);
      expect(row).toHaveTextContent("+36%");
    }
    expect(document.body).not.toHaveTextContent("Received Accuracy");
  },
);
