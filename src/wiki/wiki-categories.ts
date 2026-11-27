import { WikiCategory, WikiCategorySlug, WikiSeries, WIKI_CATEGORY_SLUGS } from "./wiki-types";

/** In the order shown on the wiki home page. Categories without articles are hidden. */
export const WIKI_CATEGORIES: WikiCategory[] = [
  {
    slug: "basics",
    title: "Getting Started",
    description: "The basics of Company of Heroes 3 and how to read the numbers on unit cards.",
    icon: "book",
    color: "teal",
  },
  {
    slug: "tips",
    title: "Game Tips",
    description:
      "Every tip from the loading screens of the game, sorted by topic: combat, vehicles, engineers, economy and more.",
    icon: "bulb",
    color: "yellow",
    // Eight pages of tips would push the articles down the sidebar.
    collapsed: true,
  },
  {
    slug: "combat",
    title: "Combat Mechanics",
    description:
      "How weapons actually fire, hit and miss. Firing cycles, attack speed, accuracy, scatter, projectiles and cover.",
    icon: "crosshair",
    color: "red",
    groups: [
      { id: "cover", title: "Cover" },
      { id: "firing", title: "Firing & Attack Speed" },
      { id: "accuracy", title: "Accuracy & Scatter" },
    ],
  },
  {
    slug: "veterancy",
    title: "Units & Veterancy",
    description: "How units gain experience and what veterancy changes.",
    icon: "medal",
    color: "yellow",
  },
  {
    slug: "economy",
    title: "Economy & Resources",
    description: "Manpower, munitions, fuel and how income works.",
    icon: "coins",
    color: "green",
    groups: [{ id: "territory", title: "Territory" }],
  },
  {
    slug: "multiplayer",
    title: "Multiplayer",
    description:
      "Playing against other players: ranked play, leagues and tiers, ELO and the leaderboards.",
    icon: "trophy",
    color: "orange",
  },
  {
    slug: "site",
    title: "Using COH3 Stats",
    description: "How the numbers on this site are calculated.",
    icon: "chart",
    color: "blue",
  },
];

export const WIKI_SERIES: WikiSeries[] = [
  { id: "firing-cycles", title: "Rate of fire & attack speed deep dive" },
  { id: "accuracy-scatter", title: "Accuracy & scatter explained" },
  { id: "cover", title: "How cover works" },
  { id: "territory-capture", title: "Capturing territory like a pro" },
];

export const isWikiCategory = (value: unknown): value is WikiCategorySlug =>
  typeof value === "string" && (WIKI_CATEGORY_SLUGS as readonly string[]).includes(value);

export const getWikiCategory = (slug: string): WikiCategory | undefined =>
  WIKI_CATEGORIES.find((category) => category.slug === slug);

export const getWikiSeries = (id: string): WikiSeries | undefined =>
  WIKI_SERIES.find((series) => series.id === id);
