/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PageJsonLd from "../../components/page-json-ld";

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "de" }),
}));

/** The JSON-LD scripts of the rendered markup, parsed. */
const renderJsonLd = (element: React.ReactElement) => {
  const html = renderToStaticMarkup(element);
  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/g),
  ];

  return scripts.map(([, json]) => JSON.parse(json));
};

describe("PageJsonLd", () => {
  it("renders the breadcrumb trail from the home page and the WebPage", () => {
    const [breadcrumbs, webPage] = renderJsonLd(
      <PageJsonLd
        path="/explorer/races/american/units/riflemen_us"
        name="Riflemen - US Forces infantry"
        description="Riflemen of the US Forces."
        breadcrumbName="Riflemen"
        trail={[
          { name: "Erkunden", path: "/explorer" },
          { name: "US Forces", path: "/explorer/races/american" },
        ]}
        image="https://cdn.coh3stats.com/riflemen.png"
      />,
    );

    expect(breadcrumbs).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "COH3 Stats",
          item: "https://coh3stats.com/de",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Erkunden",
          item: "https://coh3stats.com/de/explorer",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "US Forces",
          item: "https://coh3stats.com/de/explorer/races/american",
        },
        { "@type": "ListItem", position: 4, name: "Riflemen" },
      ],
    });
    expect(webPage).toMatchObject({
      "@type": "WebPage",
      "@id": "https://coh3stats.com/de/explorer/races/american/units/riflemen_us",
      name: "Riflemen - US Forces infantry",
      description: "Riflemen of the US Forces.",
      inLanguage: "de",
      primaryImageOfPage: { url: "https://cdn.coh3stats.com/riflemen.png" },
      about: { name: "Company of Heroes 3" },
    });
  });

  it("ends the trail at the page under the home page without a trail", () => {
    const [breadcrumbs] = renderJsonLd(
      <PageJsonLd path="/tournaments" name="Tournaments" breadcrumbName="Turniere" />,
    );

    expect(breadcrumbs.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "COH3 Stats",
        item: "https://coh3stats.com/de",
      },
      { "@type": "ListItem", position: 2, name: "Turniere" },
    ]);
  });

  it("has the site instead of the breadcrumb trail on the home page", () => {
    const [site, webPage, ...rest] = renderJsonLd(<PageJsonLd path="" name="COH3 Stats" />);

    expect(rest).toHaveLength(0);
    expect(site["@graph"].map((node: { "@type": string }) => node["@type"])).toEqual([
      "WebSite",
      "Organization",
    ]);
    // The site is the same for every locale, the page is the one of the locale
    expect(site["@graph"][0].url).toBe("https://coh3stats.com");
    expect(webPage).toMatchObject({ "@type": "WebPage", "@id": "https://coh3stats.com/de" });
  });

  it("renders a ProfilePage of the player", () => {
    const [, webPage] = renderJsonLd(
      <PageJsonLd
        path="/players/26631"
        name="Thomas - Player Card"
        type="ProfilePage"
        mainEntity={{ "@type": "Person", name: "Thomas" }}
      />,
    );

    expect(webPage).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: { "@type": "Person", name: "Thomas" },
    });
  });
});
