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
  await act(async () => root.render(<MantineProvider env="test">{element}</MantineProvider>));
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

it("enters ground attack from the keyboard and moves the aim in coarse and fine steps", async () => {
  await render(<Formation />);
  const diagram = container.querySelector<HTMLElement>(
    '[role="group"][aria-label="Infantry formation and aiming"]',
  )!;
  expect(diagram).toHaveAttribute("tabindex", "0");
  expect(document.getElementById(diagram.getAttribute("aria-describedby")!)).toHaveTextContent(
    "Arrow keys",
  );
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
    for (const [name, value] of [
      ["Received Accuracy Modifier", scope === "defensive" ? "-15%" : "0.85"],
      ["Received Damage Modifier", scope === "defensive" ? "+10%" : "0.9"],
    ]) {
      const matching = badges.filter((badge) =>
        scope === "defensive"
          ? badge.textContent?.trim() === `★ ${value}`
          : badge.textContent?.includes(name),
      );
      expect(matching).toHaveLength(1);
      expect(matching[0]).toHaveTextContent(value);
      if (scope === "defensive")
        expect(badges.some((badge) => badge.textContent?.includes(name))).toBe(false);
    }
  },
);
