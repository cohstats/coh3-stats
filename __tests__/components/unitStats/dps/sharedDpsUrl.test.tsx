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
  mockRouter.asPath = "/explorer/dps";
  mockRouter.replace.mockReset().mockResolvedValue(true);
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
const pendingNavigation = () => {
  let reject!: (reason: Error) => void;
  const promise = new Promise<boolean>((_resolve, rejectPromise) => {
    reject = rejectPromise;
  });
  return { promise, reject };
};

it.each(["current", ""])(
  "retries a failed write of %j after its effect was cancelled",
  async (hash) => {
    const navigation = pendingNavigation();
    mockRouter.replace.mockReturnValueOnce(navigation.promise);
    mockRouter.asPath = "/explorer/dps#setup=older";
    encode.mockResolvedValue(hash);
    await render(setup(false));
    await advance(150);

    await render(setup(true));
    await act(async () => navigation.reject(new Error("Navigation failed")));
    await render(setup(false));
    await advance(150);
    expect(mockRouter.replace).toHaveBeenCalledTimes(2);
    expect(mockRouter.replace.mock.calls[1][0].hash).toBe(hash ? `setup=${hash}` : "");
  },
);

it("preserves a newer write's marker when an older navigation fails", async () => {
  const navigation = pendingNavigation();
  mockRouter.replace.mockReturnValueOnce(navigation.promise);
  encode.mockResolvedValueOnce("first").mockResolvedValue("newer");
  await render(setup(false));
  await advance(150);
  await render(setup(true));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(2);

  await act(async () => navigation.reject(new Error("Old navigation failed")));
  await render(setup(false));
  await render(setup(true));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(2);
});

it("preserves a newer write of the same hash when the original navigation fails", async () => {
  const navigation = pendingNavigation();
  mockRouter.replace.mockReturnValueOnce(navigation.promise);
  encode
    .mockResolvedValueOnce("first")
    .mockResolvedValueOnce("second")
    .mockResolvedValue("first");
  await render(setup(false));
  await advance(150);
  await render(setup(true));
  await advance(150);
  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(3);

  await act(async () => navigation.reject(new Error("Original navigation failed")));
  await render(setup(true));
  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(3);
});

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

it("leaves a fresh calculator URL bare", async () => {
  encode.mockResolvedValue("");
  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).not.toHaveBeenCalled();
});

it("removes an existing default-only setup hash", async () => {
  encode.mockResolvedValue("");
  mockRouter.asPath = "/explorer/dps#setup=defaults";
  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(1);
  expect(mockRouter.replace.mock.calls[0][0].hash).toBe("");
});

it("clears the hash when all settings return to defaults", async () => {
  encode.mockResolvedValueOnce("edited").mockResolvedValueOnce("");
  await render(setup(true));
  await advance(150);
  mockRouter.asPath = "/explorer/dps#setup=edited";
  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(2);
  expect(mockRouter.replace.mock.calls[1][0].hash).toBe("");
});

it("records an already-matching URL so edits can return to a previously written setup", async () => {
  encode
    .mockResolvedValueOnce("first")
    .mockResolvedValueOnce("current")
    .mockResolvedValueOnce("first");
  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(1);

  mockRouter.asPath = "/explorer/dps#setup=current";
  await render(setup(true));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(1);

  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(2);
  expect(mockRouter.replace.mock.calls[1][0].hash).toBe("setup=first");
});

it("does not record a matching URL from a cancelled compression", async () => {
  let finishOld!: (value: string) => void;
  encode
    .mockReturnValueOnce(
      new Promise((resolve) => {
        finishOld = resolve;
      }),
    )
    .mockResolvedValueOnce("current")
    .mockResolvedValueOnce("stale");
  await render(setup(false));
  await advance(150);
  await render(setup(true));
  await advance(150);

  mockRouter.asPath = "/explorer/dps#setup=stale";
  await act(async () => finishOld("stale"));
  expect(mockRouter.replace).toHaveBeenCalledTimes(1);

  mockRouter.asPath = "/explorer/dps#setup=current";
  await render(setup(false));
  await advance(150);
  expect(mockRouter.replace).toHaveBeenCalledTimes(2);
  expect(mockRouter.replace.mock.calls[1][0].hash).toBe("setup=stale");
});
