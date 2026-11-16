import React, { act } from "react";
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
  }: {
    unit?: CustomizableUnit;
    position: number;
    patchVersion: string;
  }) => (
    <output
      data-testid={`loaded-unit-${position}`}
    >{`${patchVersion}:${unit?.screen_name ?? ""}`}</output>
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
  await renderTool(<DpsPageComponent {...dataset()} />);
  expect(getByTestId("dps-unit-search-1")).toHaveValue(
    `hoff_player_riflemen_us ${config.latestPatch}`,
  );
  expect(getByTestId("dps-unit-search-2")).toHaveValue(`attacker ${config.latestPatch}`);
  expect(getByTestId("loaded-unit-0")).toHaveTextContent("hoff_player_riflemen_us");
  expect(mockRouter.replace).not.toHaveBeenCalled();
});
