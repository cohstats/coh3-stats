/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { getStaticPaths, getStaticProps } from "../../pages/wiki/[category]/[slug]";
import WikiArticlePage, { WikiArticlePageProps } from "../../screens/wiki/wiki-article-page";
import { WIKI_ARTICLES } from "../../src/wiki/data";
import { getIngameTips } from "../../src/explorer/ingame-tips/ingame-tips";
import { IngameTip } from "../../src/explorer/ingame-tips/ingame-tips-types";
import config from "../../config";

const tip = (overrides: Partial<IngameTip> & Pick<IngameTip, "id">): IngameTip => ({
  pbgid: 1,
  text: `Text of ${overrides.id}`,
  category: "cover",
  topic: "combat",
  gameMode: null,
  ...overrides,
});

// The tip pages download the tips of the latest patch, served from here instead.
jest.mock("../../src/explorer/ingame-tips/ingame-tips", () => ({
  getIngameTips: jest.fn(),
}));

jest.mock("next-i18next/pages/serverSideTranslations", () => ({
  serverSideTranslations: jest.fn().mockResolvedValue({}),
}));

jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "en", push: jest.fn() }),
}));

const getProps = async (category: string, slug: string) => {
  const result = await getStaticProps({ params: { category, slug }, locale: "en" } as any);
  if (!("props" in result)) throw new Error("Expected wiki article props.");
  return result.props as WikiArticlePageProps;
};

describe("/wiki/[category]/[slug]", () => {
  it("builds a path for every article", async () => {
    const { paths } = await getStaticPaths({ locales: ["en"] } as any);
    expect(paths).toHaveLength(WIKI_ARTICLES.length);
  });

  it("returns 404 for an article in the wrong category", async () => {
    const result = await getStaticProps({
      params: { category: "veterancy", slug: "scatter" },
      locale: "en",
    } as any);
    expect(result).toEqual({ notFound: true });
  });

  it("returns the article with its series and neighbours", async () => {
    const props = await getProps("combat", "scatter");
    expect(props.article.title).toContain("Scatter");
    expect(props.categoryTitle).toBe("Combat Mechanics");
    expect(props.groupTitle).toBe("Accuracy & Scatter");
    expect(props.series?.part).toBe(3);
    expect(props.previous?.slug).toBe("shot-placement-armour-and-damage-spread");
    expect(props.next?.slug).toBe("terrain-and-projectile-flight");
    expect(props.headings[0]).toEqual({
      id: "scatter-basics",
      label: "Scatter basics",
      level: 2,
    });
    // Next.js can't serialize undefined props.
    expect(JSON.parse(JSON.stringify(props))).toEqual(props);
  });

  it("lists the tips of a Game Tips page in sections, without the author and date", async () => {
    (getIngameTips as jest.Mock).mockResolvedValue({
      patch: "latest",
      locale: "en",
      tips: [
        tip({ id: "tipcover10", text: "Tanks provide Heavy cover." }),
        tip({ id: "tipcover2", text: "Cover is directional." }),
        tip({ id: "tipfire1", category: "fire", text: "Flame weapons <burn>." }),
        tip({ id: "tipgrenades1", topic: "abilities", category: "grenades" }),
        tip({ id: "tiparmor1", topic: "vehicles", category: "armor", text: "Rear armor." }),
        tip({ id: "hoff_tipperks1", topic: "final_stand", category: "perks", gameMode: "hoff" }),
      ],
    });

    const props = await getProps("tips", "combat");
    expect(props.tips?.count).toBe(4);
    expect(props.headings).toEqual([
      { id: "cover", label: "Cover", level: 2 },
      { id: "more-tips", label: "More Tips", level: 2 },
    ]);
    expect(props.patch).toBe(config.latestPatch);
    // Next.js can't serialize undefined props.
    expect(JSON.parse(JSON.stringify(props))).toEqual(props);

    const html = renderToStaticMarkup(
      <MantineProvider>
        <WikiArticlePage {...props} />
      </MantineProvider>,
    );
    expect(html).toContain(`id="tip-tipcover2"`);
    expect(html.indexOf("Cover is directional.")).toBeLessThan(
      html.indexOf("Tanks provide Heavy cover."),
    );
    // The game text is escaped, never parsed as markup.
    expect(html).toContain("Flame weapons &lt;burn&gt;.");
    expect(html).not.toContain("Rear armor.");
    expect(html).toContain(`data-testid="wiki-tips-count"`);
    expect(html).not.toContain(`data-testid="wiki-article-date"`);
    expect(html).not.toContain(`data-testid="wiki-tips-unavailable"`);
  });

  it("says so when the tips can't be loaded", async () => {
    (getIngameTips as jest.Mock).mockResolvedValue(null);

    const props = await getProps("tips", "final-stand");
    expect(props.tips).toEqual({ sections: [], count: 0 });
    expect(props.headings).toEqual([]);

    const html = renderToStaticMarkup(
      <MantineProvider>
        <WikiArticlePage {...props} />
      </MantineProvider>,
    );
    expect(html).toContain(`data-testid="wiki-tips-unavailable"`);
  });

  it("doesn't download the tips for an ordinary article", async () => {
    (getIngameTips as jest.Mock).mockClear();
    const props = await getProps("combat", "scatter");
    expect(props.tips).toBeNull();
    expect(getIngameTips).not.toHaveBeenCalled();
  });

  it("renders the breadcrumbs, headings with ids, figures and tables", async () => {
    const props = await getProps("veterancy", "unit-experience-gains");
    const html = renderToStaticMarkup(
      <MantineProvider>
        <WikiArticlePage {...props} />
      </MantineProvider>,
    );

    expect(html).toContain(`data-testid="wiki-breadcrumbs"`);
    expect(html).toContain(`id="experience-from-kills"`);
    expect(html).toContain("<figcaption");
    expect(html).toContain("<tbody><tr>");
    expect(html).toContain("<p>For example, a Crusader");
    expect(html).not.toContain("reddit.com");
    expect(html).toContain(`data-testid="wiki-article-date"`);
    expect(html).not.toContain(`data-testid="wiki-article-updated"`);
  });

  it("shows the written date on the attack speed examples page", async () => {
    const props = await getProps("combat", "attack-speed-buff-examples");
    const html = renderToStaticMarkup(
      <MantineProvider>
        <WikiArticlePage {...props} />
      </MantineProvider>,
    );

    expect(html).toContain(`data-testid="wiki-article-date"`);
    expect(html).not.toContain("A small plea to Relic");
  });

  it("links the author name only when the article has an author url", async () => {
    const render = async (category: string, slug: string) => {
      const props = await getProps(category, slug);
      return renderToStaticMarkup(
        <MantineProvider>
          <WikiArticlePage {...props} />
        </MantineProvider>,
      );
    };

    const linked = await render("combat", "cover-basics");
    expect(linked).toContain(`data-testid="wiki-article-author-link"`);
    expect(linked).toContain(`href="https://www.youtube.com/@tightropegaming"`);

    const plain = await render("combat", "scatter");
    expect(plain).not.toContain(`data-testid="wiki-article-author-link"`);
    expect(plain).toContain("Tsuyara");
  });

  it("lists multiple authors, each linked only when it has a url", async () => {
    const props = await getProps("combat", "cover-basics");
    const html = renderToStaticMarkup(
      <MantineProvider>
        <WikiArticlePage
          {...props}
          article={{
            ...props.article,
            authors: [
              { name: "tightrope", url: "https://www.youtube.com/@tightropegaming" },
              { name: "Tsuyara" },
              { name: "Third", url: "https://example.com/third" },
            ],
          }}
        />
      </MantineProvider>,
    );

    expect(html.match(/data-testid="wiki-article-author-link"/g)).toHaveLength(2);
    expect(html).toContain(`href="https://example.com/third"`);
    expect(html).toMatch(/tightrope<\/a>, Tsuyara &amp; <a[^>]*>Third<\/a>/);
  });
});
