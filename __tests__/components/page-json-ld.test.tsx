/**
 * @jest-environment node
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ExplorerJsonLd from "../../components/explorer-json-ld";

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: "de" }),
}));

jest.mock("next-i18next/pages", () => ({
  useTranslation: () => ({
    t: (key: string) => (key === "mainMenu.explorer" ? "Erkunden" : key),
  }),
}));

/** The JSON-LD scripts of the rendered markup, parsed. */
const renderJsonLd = (element: React.ReactElement) => {
  const html = renderToStaticMarkup(element);
  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/g),
  ];

  return scripts.map(([, json]) => JSON.parse(json));
};

describe("ExplorerJsonLd", () => {
  it("renders the breadcrumb trail through the Explorer and the WebPage", () => {
    const [breadcrumbs, webPage] = renderJsonLd(
      <ExplorerJsonLd
        path="/explorer/races/american/units/riflemen_us"
        name="Riflemen - US Forces infantry"
        description="Riflemen of the US Forces."
        breadcrumbName="Riflemen"
        trail={[{ name: "US Forces", path: "/explorer/races/american" }]}
        image="https://cdn.coh3stats.com/riflemen.png"
      />,
    );

    expect(breadcrumbs).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "COH3 Stats", item: "https://coh3stats.com" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Erkunden",
          item: "https://coh3stats.com/explorer",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "US Forces",
          item: "https://coh3stats.com/explorer/races/american",
        },
        { "@type": "ListItem", position: 4, name: "Riflemen" },
      ],
    });
    expect(webPage).toMatchObject({
      "@type": "WebPage",
      "@id": "https://coh3stats.com/explorer/races/american/units/riflemen_us",
      name: "Riflemen - US Forces infantry",
      description: "Riflemen of the US Forces.",
      inLanguage: "de",
      primaryImageOfPage: { url: "https://cdn.coh3stats.com/riflemen.png" },
      about: { name: "Company of Heroes 3" },
    });
  });

  it("ends the trail at the Explorer on the Explorer page itself", () => {
    const [breadcrumbs] = renderJsonLd(
      <ExplorerJsonLd path="/explorer" name="COH3 Explorer" breadcrumbName="Ignored" />,
    );

    expect(breadcrumbs.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "COH3 Stats", item: "https://coh3stats.com" },
      { "@type": "ListItem", position: 2, name: "Erkunden" },
    ]);
  });
});
