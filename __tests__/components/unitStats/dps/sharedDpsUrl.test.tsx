import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useSharedDpsUrl } from "../../../../components/unitStats/dps/useSharedDpsUrl";
import {
  encodeSharedDpsSetup,
  type SharedDpsSetup,
} from "../../../../src/unitStats/sharedDpsSetup";
import config from "../../../../config";

jest.mock("../../../../src/unitStats/sharedDpsSetup", () => ({
  encodeSharedDpsSetup: jest.fn(),
}));
jest.mock("next/router", () => ({ useRouter: () => mockRouter }));

const mockRouter = {
  isReady: true,
  pathname: "/explorer/dps",
  asPath: "/explorer/dps",
  query: {},
  replace: jest.fn().mockResolvedValue(true),
};
const encode = jest.mocked(encodeSharedDpsSetup);
const setup = (showDpsHealth: boolean): SharedDpsSetup => ({
  v: 1,
  mode: "vs",
  allowAllWeapons: false,
  showFinalStand: false,
  showDpsHealth,
  filters: [[], []],
  slots: [
    { patch: config.latestPatch, unit: null },
    { patch: config.latestPatch, unit: null },
  ],
});
const Harness = ({ value }: { value: SharedDpsSetup }) => {
  useSharedDpsUrl(true, value);
  return null;
};

let container: HTMLDivElement;
let root: Root;
beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
beforeEach(() => {
  jest.useFakeTimers();
  encode.mockReset().mockResolvedValue("current");
  mockRouter.replace.mockClear();
  container = document.createElement("div");
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  jest.useRealTimers();
});
const render = async (value: SharedDpsSetup) => {
  await act(async () => root.render(<Harness value={value} />));
};
const advance = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

it("does not let a slow compression overwrite a newer setup", async () => {
  let finishOld!: (value: string) => void;
  encode.mockReturnValueOnce(
    new Promise((resolve) => {
      finishOld = resolve;
    }),
  );
  await render(setup(false));
  await advance(150);
  await render(setup(true));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace.mock.calls[0][0].hash).toBe("setup=current");
  await act(async () => finishOld("stale"));
  expect(mockRouter.replace).toHaveBeenCalledTimes(1);
});

it("does not write a link after leaving the calculator during compression", async () => {
  let finish!: (value: string) => void;
  encode.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  await render(setup(false));
  await advance(150);
  await act(async () => root.render(null));
  await act(async () => finish("late"));
  expect(mockRouter.replace).not.toHaveBeenCalled();
});

it("compresses only the latest setup after rapid edits", async () => {
  await render(setup(false));
  await advance(100);
  await render(setup(true));
  await advance(150);
  expect(encode).toHaveBeenCalledTimes(1);
  expect(encode).toHaveBeenCalledWith(setup(true));
});
