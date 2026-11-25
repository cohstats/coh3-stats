/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MantineProvider } from "@mantine/core";
import { getStaticPaths, getStaticProps } from "../../pages/wiki/[category]/[slug]";
import WikiArticlePage, { WikiArticlePageProps } from "../../screens/wiki/wiki-article-page";
import { WIKI_ARTICLES } from "../../src/wiki/data";

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

  it("shows the updated date next to the written date", async () => {
    const props = await getProps("combat", "attack-speed-buff-examples");
    const html = renderToStaticMarkup(
      <MantineProvider>
        <WikiArticlePage {...props} />
      </MantineProvider>,
    );

    expect(html).toContain(`data-testid="wiki-article-date"`);
    expect(html).toContain(`data-testid="wiki-article-updated"`);
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
