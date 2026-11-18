import React, { act } from "react";
import { TextEncoder, TextDecoder } from "node:util";
import { CompressionStream, DecompressionStream } from "node:stream/web";
import { createRoot, Root } from "react-dom/client";
import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import config from "../../../../config";
import DpsPage from "../../../../pages/explorer/dps";
import DpsComparePage from "../../../../pages/explorer/dps-compare";
import { DpsPageComponent } from "../../../../components/unitStats/dps/dpsPageComponent";
import { DpsComparePageComponent } from "../../../../components/unitStats/dps/dpsComparePageComponent";
import { EMPTY_DPS_DATA, fetchDpsData } from "../../../../src/unitStats/dpsData";
import type { DpsData } from "../../../../src/unitStats/dpsData";
import type { SbpsType } from "../../../../src/unitStats/mappingSbps";
import type { CustomizableUnit } from "../../../../src/unitStats/dpsCommon";
import {
  snapshotDpsUnit,
  encodeSharedDpsSetup,
  decodeSharedDpsSetup,
  type SharedDpsSetup,
} from "../../../../src/unitStats/sharedDpsSetup";

jest.mock("../../../../src/unitStats/dpsData", () => ({
  ...jest.requireActual("../../../../src/unitStats/dpsData"),
  fetchDpsData: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("next-i18next/pages/serverSideTranslations", () => ({
  serverSideTranslations: jest.fn(),
}));

jest.mock("next-seo/pages", () => ({ generateNextSeo: () => null }));
jest.mock("../../../../components/page-json-ld", () => () => null);
jest.mock("../../../../src/firebase/analytics", () => ({
  AnalyticsDPSExplorerPageView: jest.fn(),
  AnalyticsDPSComparePageView: jest.fn(),
  AnalyticsDPSExplorerPatchSelection: jest.fn(),
  AnalyticsDPSExplorerSquadSelection: jest.fn(),
}));

// Keep the real pages, download hook, catalogs, and Mantine selectors. Charts and
// customization controls are outside these loading/selection regressions.
jest.mock("react-chartjs-2", () => ({ Line: () => null }));
jest.mock("../../../../components/unitStats/dps/components/ChartPanel", () => ({
  ChartPanel: ({ isLoading }: { isLoading: boolean }) =>
    isLoading ? <div role="status">Loading chart data</div> : null,
}));
jest.mock("../../../../components/unitStats/dps/components/UnitCustomizationPanel", () => ({
  UnitCustomizationPanel: ({
    unit,
    position,
    patchVersion,
    onSquadConfigChange,
  }: {
    unit?: CustomizableUnit;
    position: number;
    patchVersion: string;
    onSquadConfigChange?: () => void;
  }) => (
    <>
      <output
        data-testid={`loaded-unit-${position}`}
        data-unit={JSON.stringify(snapshotDpsUnit(unit))}
      >{`${patchVersion}:${unit?.screen_name ?? ""}`}</output>
      {unit && (
        <button
          onClick={() => {
            unit.custom_modifiers!.damage = { type: "additive", value: 25, enabled: true };
            onSquadConfigChange?.();
          }}
        >
          Adjust damage {position}
        </button>
      )}
    </>
  ),
}));
jest.mock("../../../../components/unitStats/dps/dpsUnitCustomizing", () => ({
  DpsUnitCustomizing: () => null,
}));

const fetchData = jest.mocked(fetchDpsData);
const mockRouter = {
  locale: "en",
  isReady: false,
  query: {} as Record<string, string>,
  pathname: "/explorer/dps",
  asPath: "/explorer/dps",
  push: jest.fn(),
  replace: jest.fn(),
};
const [olderPatch, failedPatch] = Object.keys(config.patches).filter(
  (patch) => patch !== config.latestPatch,
);

const dataset = (patch = config.latestPatch): DpsData => {
  const sbpsData = [
    "attacker",
    "panzergrenadier_ak",
    "halftrack_250_ak",
    "hoff_player_riflemen_us",
  ].map(
    (id) =>
      ({
        id,
        path: `${id.startsWith("hoff_") ? "hoff/" : ""}american/infantry/${id}`,
        faction: "american",
        unitType: id === "halftrack_250_ak" ? "vehicles" : "infantry",
        ui: {
          screenName: `${id} ${patch}`,
          helpText: "",
          iconName: "unit",
          symbolIconName: "symbol",
        },
        loadout: [],
        populationExt: {
          personnel_pop: 0,
          upkeep_per_pop: { fuel: 0, manpower: 0, munition: 0 },
        },
      }) as unknown as SbpsType,
  );
  return {
    ...EMPTY_DPS_DATA,
    patch,
    sbpsData,
    unitOptions: sbpsData.map((squad) => ({
      id: squad.id,
      path: squad.path,
      label: squad.ui.screenName,
      value: squad.id,
      screen_name: squad.ui.screenName,
      description: "",
      image: "unit",
      type_icon: "symbol",
      icon_name: "unit",
      unit_type: squad.unitType,
      faction: "american",
      hasWeapons: true,
      infantryTarget: squad.unitType === "infantry",
    })),
  };
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

let container: HTMLDivElement;
let root: Root;

const renderTool = async (element: React.ReactNode) => {
  await act(async () => root.render(<MantineProvider env="test">{element}</MantineProvider>));
  await settleSharedSetup();
};

const settleSharedSetup = async () => {
  const deadline = Date.now() + 2000;
  while (container.querySelector('[role="status"]')?.textContent === "Loading shared setup…") {
    if (Date.now() > deadline) throw new Error("Shared setup did not finish loading");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
};

const getByTestId = (id: string) => {
  const element = container.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  expect(element).not.toBeNull();
  return element!;
};

const patchInputs = () =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[placeholder="Patch"]'));
const alert = () => container.querySelector('[role="alert"]');
const status = () => container.querySelector('[role="status"]');
const retryButton = () =>
  Array.from(container.querySelectorAll("button")).find(
    (button) => button.textContent === "Retry",
  );

const click = async (element: HTMLElement) => {
  await act(async () => element.click());
};

const choose = async (input: HTMLElement, label: string) => {
  await click(input);
  const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    (option) => {
      if (option.textContent !== label) return false;
      // Mantine keeps other selectors' closed dropdowns mounted.
      for (let parent: HTMLElement | null = option; parent; parent = parent.parentElement) {
        if (getComputedStyle(parent).display === "none") return false;
      }
      return true;
    },
  );
  expect(option).toBeDefined();
  await click(option!);
};

beforeAll(() => {
  Object.assign(globalThis, {
    TextEncoder,
    TextDecoder,
    CompressionStream,
    DecompressionStream,
    IS_REACT_ACT_ENVIRONMENT: true,
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  fetchData.mockReset();
  mockRouter.isReady = false;
  mockRouter.query = {};
  mockRouter.pathname = "/explorer/dps";
  mockRouter.asPath = "/explorer/dps";
  mockRouter.replace.mockClear();
  jest.spyOn(console, "error").mockImplementation(() => {});
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.restoreAllMocks();
});

it.each([
  ["VS", DpsPage],
  ["Compare", DpsComparePage],
])("shows an initial error and retries to recovery in %s mode", async (_mode, Page) => {
  const recovery = deferred<DpsData>();
  fetchData
    .mockRejectedValueOnce(new Error("Initial download failed"))
    .mockRejectedValueOnce(new Error("Still unavailable"))
    .mockReturnValueOnce(recovery.promise);
  await renderTool(<Page />);

  expect(alert()).toHaveTextContent("Unable to load DPS data");
  expect(status()).not.toBeInTheDocument();
  expect(document.querySelector(".mantine-Loader-root")).toBeNull();

  await click(retryButton()!);
  expect(alert()).toBeVisible();
  expect(fetchData).toHaveBeenCalledTimes(2);

  await click(retryButton()!);
  expect(fetchData).toHaveBeenCalledTimes(3);
  expect(alert()).not.toBeInTheDocument();

  await act(async () => recovery.resolve(dataset()));
  expect(patchInputs()[0]).toHaveValue(config.latestPatch);
  expect(patchInputs()[0]).toBeEnabled();
  expect(retryButton()).toBeUndefined();
  expect(status()).not.toBeInTheDocument();
  expect(document.querySelector(".mantine-Loader-root")).toBeNull();
});

it.each([0, 1])(
  "keeps VS slot %i on its loaded patch when a subsequent download fails",
  async (slot) => {
    await renderTool(<DpsPageComponent {...dataset()} />);
    const patches = patchInputs();
    await choose(getByTestId(`dps-unit-search-${slot + 1}`), `attacker ${config.latestPatch}`);

    fetchData.mockResolvedValueOnce(dataset(olderPatch));
    await choose(patches[slot], olderPatch);
    expect(patches[slot]).toHaveValue(olderPatch);
    expect(getByTestId(`loaded-unit-${slot}`)).toHaveTextContent(
      `${olderPatch}:attacker ${olderPatch}`,
    );

    const failedDownload = deferred<DpsData>();
    fetchData.mockReturnValueOnce(failedDownload.promise);
    await choose(patches[slot], failedPatch);
    expect(patches[slot]).toBeDisabled();
    expect(patches[slot]).toHaveValue(olderPatch);
    expect(patches[1 - slot]).toBeEnabled();
    expect(patches[1 - slot]).toHaveValue(config.latestPatch);

    await act(async () => failedDownload.reject(new Error("Patch download failed")));
    expect(patches[slot]).toBeEnabled();
    expect(patches[slot]).toHaveValue(olderPatch);
    expect(getByTestId(`dps-unit-search-${slot + 1}`)).toHaveValue(`attacker ${olderPatch}`);
    expect(getByTestId(`loaded-unit-${slot}`)).toHaveTextContent(
      `${olderPatch}:attacker ${olderPatch}`,
    );
    expect(status()).not.toBeInTheDocument();

    fetchData.mockResolvedValueOnce(dataset(failedPatch));
    await choose(patches[slot], failedPatch);
    expect(patches[slot]).toHaveValue(failedPatch);
    expect(getByTestId(`loaded-unit-${slot}`)).toHaveTextContent(
      `${failedPatch}:attacker ${failedPatch}`,
    );
    expect(patches[1 - slot]).toHaveValue(config.latestPatch);
  },
);

it("keeps Compare's selector, attackers, and defender on the loaded patch after failure", async () => {
  await renderTool(<DpsComparePageComponent {...dataset()} />);
  const patch = patchInputs()[0];
  await choose(getByTestId("dps-compare-add-search"), `attacker ${config.latestPatch}`);
  await click(getByTestId("dps-compare-add-button"));

  fetchData.mockResolvedValueOnce(dataset(olderPatch));
  await choose(patch, olderPatch);
  expect(patch).toHaveValue(olderPatch);
  expect(getByTestId("dps-attacker-0")).toHaveTextContent(`attacker ${olderPatch}`);
  expect(getByTestId("loaded-unit-0")).toHaveTextContent(
    `${olderPatch}:panzergrenadier_ak ${olderPatch}`,
  );

  const failedDownload = deferred<DpsData>();
  fetchData.mockReturnValueOnce(failedDownload.promise);
  await choose(patch, failedPatch);
  expect(patch).toBeDisabled();
  expect(patch).toHaveValue(olderPatch);
  await act(async () => failedDownload.reject(new Error("Patch download failed")));

  expect(patch).toBeEnabled();
  expect(patch).toHaveValue(olderPatch);
  expect(getByTestId("dps-attacker-0")).toHaveTextContent(`attacker ${olderPatch}`);
  expect(getByTestId("dps-compare-target-search")).toHaveValue(
    `panzergrenadier_ak ${olderPatch}`,
  );
  expect(getByTestId("loaded-unit-0")).toHaveTextContent(
    `${olderPatch}:panzergrenadier_ak ${olderPatch}`,
  );
  expect(status()).not.toBeInTheDocument();

  fetchData.mockResolvedValueOnce(dataset(failedPatch));
  await choose(patch, failedPatch);
  expect(patch).toHaveValue(failedPatch);
  expect(getByTestId("dps-attacker-0")).toHaveTextContent(`attacker ${failedPatch}`);
  expect(getByTestId("loaded-unit-0")).toHaveTextContent(
    `${failedPatch}:panzergrenadier_ak ${failedPatch}`,
  );
});

it("applies a downloaded patch to edits made while the download was pending", async () => {
  await renderTool(<DpsComparePageComponent {...dataset()} />);
  await choose(getByTestId("dps-compare-add-search"), `attacker ${config.latestPatch}`);
  await click(getByTestId("dps-compare-add-button"));
  const download = deferred<DpsData>();
  fetchData.mockReturnValueOnce(download.promise);
  await choose(patchInputs()[0], olderPatch);

  await click(
    getByTestId("dps-compare-target-type").querySelector<HTMLInputElement>(
      'input[value="other"]',
    )!,
  );
  await click(getByTestId("dps-attacker-0").querySelector("button")!);
  await choose(getByTestId("dps-compare-add-search"), `panzergrenadier_ak ${config.latestPatch}`);
  await click(getByTestId("dps-compare-add-button"));
  await act(async () => download.resolve(dataset(olderPatch)));

  expect(
    getByTestId("dps-compare-target-type").querySelector('input[value="other"]'),
  ).toBeChecked();
  expect(getByTestId("loaded-unit-0")).toHaveTextContent(
    `${olderPatch}:halftrack_250_ak ${olderPatch}`,
  );
  expect(getByTestId("dps-attacker-0")).toHaveTextContent(`panzergrenadier_ak ${olderPatch}`);
  expect(container.querySelectorAll('[data-testid^="dps-attacker-"]')).toHaveLength(1);
});

it("restores shared Final Stand units and exposes their selection without rewriting the URL", async () => {
  mockRouter.isReady = true;
  mockRouter.query = { unit1: "hoff_player_riflemen_us", unit2: "attacker" };
  const shareWrites = mockRouter.replace.mock.calls.length;
  await renderTool(<DpsPageComponent {...dataset()} />);
  expect(getByTestId("dps-unit-search-1")).toHaveValue(
    `hoff_player_riflemen_us ${config.latestPatch}`,
  );
  expect(getByTestId("dps-unit-search-2")).toHaveValue(`attacker ${config.latestPatch}`);
  expect(getByTestId("loaded-unit-0")).toHaveTextContent("hoff_player_riflemen_us");
  await flushShare(shareWrites);
  expect(mockRouter.replace.mock.calls.at(-1)![0].query).toEqual({});
  const current = await lastSetup();
  expect(current.mode).toBe("vs");
  if (current.mode !== "vs") throw new Error("Expected VS setup");
  expect(current.slots.map(({ unit }) => unit?.id)).toEqual([
    "hoff_player_riflemen_us",
    "attacker",
  ]);
});

const lastSetup = async () => {
  const hash = mockRouter.replace.mock.calls.at(-1)![0].hash as string;
  return (await decodeSharedDpsSetup(new URLSearchParams(hash).get("setup")!))!;
};
const flushShare = async (previousCallCount: number, { expectWrite = true } = {}) => {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    if (mockRouter.replace.mock.calls.length > previousCallCount) {
      if (!expectWrite) throw new Error("Unexpected shared DPS URL rewrite");
      return;
    }
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  if (expectWrite) throw new Error("Shared DPS URL was not written within 2000 ms");
};

it.each([
  ["VS", "/explorer/dps", DpsPageComponent],
  ["Compare", "/explorer/dps-compare", DpsComparePageComponent],
])("keeps a fresh %s page URL free of a setup hash", async (_mode, path, Component) => {
  mockRouter.isReady = true;
  mockRouter.pathname = path;
  mockRouter.asPath = path;
  const shareWrites = mockRouter.replace.mock.calls.length;
  await renderTool(<Component {...dataset()} />);
  await flushShare(shareWrites, { expectWrite: false });
  expect(mockRouter.replace).not.toHaveBeenCalled();
});

it("clears an existing default-only Compare link after restoring its default defender", async () => {
  mockRouter.isReady = true;
  mockRouter.pathname = "/explorer/dps-compare";
  mockRouter.asPath = `/explorer/dps-compare#setup=${await encodeSharedDpsSetup({
    v: 1,
    mode: "compare",
    patch: config.latestPatch,
    attackers: [],
    target: { id: "panzergrenadier_ak", cover: "" },
    targetType: "infantry",
    filter: [],
    allowAllWeapons: false,
    showFinalStand: false,
    scatter: {
      enabled: true,
      preset: "panzergrenadier_ak",
      formation: "default",
      directionalCover: false,
      disabledModelIds: [],
      targetModelId: 1,
      groundTarget: null,
      gunnerAngleDeg: 270,
    },
    samples: 576,
    fogOfWar: false,
    preview: null,
  })}`;
  const shareWrites = mockRouter.replace.mock.calls.length;
  await renderTool(<DpsComparePageComponent {...dataset()} />);
  await flushShare(shareWrites);
  expect(getByTestId("dps-compare-target-search")).toHaveValue(
    `panzergrenadier_ak ${config.latestPatch}`,
  );
  expect(mockRouter.replace.mock.calls.at(-1)![0].hash).toBe("");
});

it("loads both VS patches, settings, and modifiers from the URL and records later edits", async () => {
  mockRouter.isReady = true;
  const saved: SharedDpsSetup = {
    v: 1,
    mode: "vs",
    allowAllWeapons: true,
    showFinalStand: true,
    showDpsHealth: true,
    filters: [["american"], []],
    slots: [
      {
        patch: olderPatch,
        unit: {
          id: "hoff_player_riflemen_us",
          weapons: [],
          cover: "heavy",
          moving: true,
          modifiers: { damage: { type: "additive", value: 10, enabled: true } },
        },
      },
      { patch: config.latestPatch, unit: { id: "attacker", weapons: [], vet: 2 } },
    ],
  };
  mockRouter.asPath = `/explorer/dps#setup=${await encodeSharedDpsSetup(saved)}`;
  fetchData.mockResolvedValueOnce(dataset(olderPatch));
  await renderTool(<DpsPageComponent {...dataset()} />);
  expect(fetchData).toHaveBeenCalledWith(olderPatch);
  expect(patchInputs().map((input) => input.value)).toEqual([olderPatch, config.latestPatch]);
  expect(getByTestId("dps-unit-search-1")).toHaveValue(`hoff_player_riflemen_us ${olderPatch}`);
  expect(JSON.parse(getByTestId("loaded-unit-0").getAttribute("data-unit")!)).toMatchObject(
    saved.slots[0].unit!,
  );
  const shareWrites = mockRouter.replace.mock.calls.length;
  await click(
    Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Adjust damage 0",
    )!,
  );
  await flushShare(shareWrites);
  const current = await lastSetup();
  expect(current.mode).toBe("vs");
  if (current.mode !== "vs") throw new Error("Expected VS setup");
  expect(current.slots[0].unit?.modifiers?.damage.value).toBe(25);
  expect(current.slots[1].unit?.vet).toBe(2);
  expect(current.showDpsHealth).toBe(true);
  expect(current.allowAllWeapons).toBe(true);
});

it("loads and preserves the comparison's target, formation, aiming and display settings", async () => {
  mockRouter.isReady = true;
  mockRouter.pathname = "/explorer/dps-compare";
  const saved: SharedDpsSetup = {
    v: 1,
    mode: "compare",
    patch: olderPatch,
    attackers: [{ id: "attacker", weapons: [], moving: true }],
    target: { id: "panzergrenadier_ak", weapons: [], cover: "heavy" },
    targetType: "infantry",
    filter: ["american"],
    allowAllWeapons: true,
    showFinalStand: true,
    scatter: {
      enabled: true,
      preset: "panzergrenadier_ak",
      formation: "cover",
      directionalCover: true,
      disabledModelIds: [2],
      targetModelId: null,
      groundTarget: { x: -2, y: 3 },
      gunnerAngleDeg: 180,
    },
    samples: 2025,
    fogOfWar: true,
    preview: null,
  };
  mockRouter.asPath = `/explorer/dps-compare#setup=${await encodeSharedDpsSetup(saved)}`;
  fetchData.mockResolvedValueOnce(dataset(olderPatch));
  const shareWrites = mockRouter.replace.mock.calls.length;
  await renderTool(<DpsComparePageComponent {...dataset()} />);
  expect(patchInputs()[0]).toHaveValue(olderPatch);
  expect(getByTestId("dps-attacker-0")).toHaveTextContent(`attacker ${olderPatch}`);
  expect(getByTestId("dps-compare-target-search")).toHaveValue(
    `panzergrenadier_ak ${olderPatch}`,
  );
  await flushShare(shareWrites);
  const current = await lastSetup();
  expect(current).toMatchObject({
    mode: "compare",
    patch: olderPatch,
    scatter: saved.scatter,
    samples: 2025,
    fogOfWar: true,
    allowAllWeapons: true,
    showFinalStand: true,
  });
});

it("keeps a shared setup retryable when its saved patch cannot initially download", async () => {
  mockRouter.isReady = true;
  const saved: SharedDpsSetup = {
    v: 1,
    mode: "vs",
    allowAllWeapons: false,
    showFinalStand: false,
    filters: [[], []],
    showDpsHealth: false,
    slots: [
      { patch: olderPatch, unit: { id: "attacker", weapons: [] } },
      { patch: config.latestPatch, unit: null },
    ],
  };
  mockRouter.asPath = `/explorer/dps#setup=${await encodeSharedDpsSetup(saved)}`;
  fetchData
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValueOnce(dataset(olderPatch));
  const shareWrites = mockRouter.replace.mock.calls.length;
  await renderTool(<DpsPageComponent {...dataset()} />);
  expect(alert()).toBeInTheDocument();
  await flushShare(shareWrites, { expectWrite: false });
  expect(mockRouter.replace).not.toHaveBeenCalled();
  await click(retryButton()!);
  await settleSharedSetup();
  expect(alert()).not.toBeInTheDocument();
  expect(getByTestId("dps-unit-search-1")).toHaveValue(`attacker ${olderPatch}`);
});
