/**
 * @jest-environment jsdom
 */

import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import SteamNewsPage from "../../../screens/news";
import type { NewsItem } from "../../../src/apis/steam-api";

jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en", push: jest.fn(), pathname: "/news", query: {} }),
}));

jest.mock("../../../src/firebase/analytics", () => ({
  AnalyticsNewsPageView: jest.fn(),
}));

const article: NewsItem = {
  gid: "steam-article",
  title: "2.5.6 Hot Fix",
  author: "Hannah_RE",
  date: 100,
  image: null,
  category: "patchNotes",
  contents: "[p]Fixed an exploit with Final Stand perks.[/p]",
};

// jsdom has no layout, pretend every article is taller than the preview.
let contentHeight = 1000;

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => contentHeight,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => 520,
  });
});

let container: HTMLDivElement;
let root: Root;

const renderPage = async () => {
  await act(async () => {
    root.render(
      <MantineProvider>
        <SteamNewsPage COH3SteamNews={{ count: 1, newsitems: [article] }} />
      </MantineProvider>,
    );
  });
};

const getButton = (label: string) =>
  Array.from(container.querySelectorAll("button")).find((b) => b.textContent === label);

const click = async (element?: HTMLElement | null) => {
  await act(async () => {
    element?.click();
  });
};

const selectView = (mode: string) =>
  click(container.querySelector<HTMLInputElement>(`input[value="${mode}"]`));

const articleText = "Fixed an exploit with Final Stand perks.";

describe("news view mode", () => {
  beforeEach(() => {
    contentHeight = 1000;
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("defaults to the preview, with the start of the article and Read more", async () => {
    await renderPage();

    expect(container.textContent).toContain(articleText);
    expect(container.querySelector("[data-overflows]")).not.toBeNull();
    expect(getButton("readMore")).toBeDefined();
  });

  it("does not offer Read more for an article that fits into the preview", async () => {
    contentHeight = 300;
    await renderPage();

    expect(container.querySelector("[data-overflows]")).toBeNull();
    expect(getButton("readMore")).toBeUndefined();
  });

  it("shows only the headline and remembers the choice", async () => {
    await renderPage();
    await selectView("headlines");

    expect(container.textContent).toContain(article.title);
    expect(container.textContent).not.toContain(articleText);
    expect(JSON.parse(window.localStorage.getItem("news-view-mode") ?? "null")).toBe("headlines");

    await click(getButton("readMore"));
    expect(container.textContent).toContain(articleText);

    await click(getButton("showLess"));
    expect(container.textContent).not.toContain(articleText);
  });

  it("shows the whole article in the full view, restored from the last visit", async () => {
    window.localStorage.setItem("news-view-mode", JSON.stringify("full"));
    await renderPage();

    expect(container.textContent).toContain(articleText);
    expect(container.querySelector("[data-overflows]")).toBeNull();
    expect(getButton("readMore")).toBeUndefined();
    expect(getButton("showLess")).toBeUndefined();
  });
});
