import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { WikiSidebar } from "../../../screens/wiki/components/wiki-sidebar";
import { getWikiNavigation } from "../../../src/wiki/get-wiki";

// React only batches act() updates when this flag is set.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("next/link", () => {
  const Link = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>((props, ref) => (
    <a ref={ref} {...props} />
  ));
  Link.displayName = "Link";
  return Link;
});

const navigation = getWikiNavigation();

describe("WikiSidebar", () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (currentArticle?: string) =>
    act(() => {
      root.render(
        <MantineProvider>
          <WikiSidebar
            navigation={navigation}
            currentCategory={currentArticle ? "combat" : undefined}
            currentArticle={currentArticle}
            homeLabel="Wiki"
            overviewLabel="Overview"
          />
        </MantineProvider>,
      );
    });

  const isOpen = (group: string) =>
    container
      .querySelector(`[data-testid="wiki-sidebar-group-${group}"]`)
      ?.getAttribute("data-expanded") === "true";

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("starts with every group collapsed on the wiki home", () => {
    render();
    expect(isOpen("cover")).toBe(false);
    expect(isOpen("firing")).toBe(false);
    expect(isOpen("accuracy")).toBe(false);
  });

  it("opens the group of the current article and keeps groups opened before", () => {
    render("cover-basics");
    expect(isOpen("cover")).toBe(true);
    expect(isOpen("accuracy")).toBe(false);

    render("scatter");
    expect(isOpen("accuracy")).toBe(true);
    expect(isOpen("cover")).toBe(true);
  });

  it("reopens a group the reader closed when moving to another article in it", () => {
    render("cover-basics");
    const cover = container.querySelector<HTMLElement>(
      '[data-testid="wiki-sidebar-group-cover"]',
    );
    act(() => cover?.click());
    expect(isOpen("cover")).toBe(false);

    render("cover-micro-tips");
    expect(isOpen("cover")).toBe(true);
  });
});
