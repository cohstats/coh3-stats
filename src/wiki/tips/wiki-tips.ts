/**
 * The "Game Tips" wiki category: the loading screen tips of the game, one page per topic.
 *
 * The pages are registered as ordinary wiki articles (so the sidebar, the cards and prev / next
 * work as for any other article), but their tips are not written in the code. They are taken from
 * the in-game tips data of the latest patch when the page is built, in the language of the page,
 * see `getWikiTipsPage`. Nothing here downloads, it is safe to use in the browser.
 */

import type { IngameTip } from "../../explorer/ingame-tips/ingame-tips-types";
import { FINAL_STAND_TIPS_GAME_MODE } from "../../explorer/ingame-tips/ingame-tips-helpers";
import { getWikiRoute } from "../../routes";
import { WikiArticle } from "../wiki-types";

export const WIKI_TIPS_CATEGORY = "tips" as const;

type WikiTipPage = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** The `topic`s of the generic (`gameMode: null`) tips shown on the page. */
  topics: string[];
};

/** The Final Stand page, it takes every tip of the mode, whatever its topic. */
export const WIKI_FINAL_STAND_TIPS_PAGE = "final-stand";

/**
 * The page for the generic tips of a topic no page lists, so a new topic in the data file shows up
 * somewhere instead of being dropped.
 */
export const WIKI_FALLBACK_TIPS_PAGE = "controls";

/** In the order of the wiki. */
const WIKI_TIP_PAGES: WikiTipPage[] = [
  {
    slug: "combat",
    title: "Combat Tips",
    summary:
      "Game tips about fighting: cover, garrisons, suppression, accuracy, facing, hold fire and grenades.",
    tags: ["cover", "garrison", "suppression"],
    topics: ["combat", "abilities"],
  },
  {
    slug: "vehicles",
    title: "Vehicle Tips",
    summary:
      "Game tips about tanks, armored cars and artillery: rear armor, barrages, anti-air and riding on tanks.",
    tags: ["vehicles", "armor", "artillery"],
    topics: ["vehicles"],
  },
  {
    slug: "engineering",
    title: "Engineering Tips",
    summary:
      "Game tips about engineers and pioneers: mines, tank traps, barbed wire, repairs, demolitions and breaching.",
    tags: ["engineers", "mines", "repair"],
    topics: ["engineering"],
  },
  {
    slug: "unit-care",
    title: "Unit Care Tips",
    summary:
      "Game tips about keeping your units alive: retreating, healing, reinforcing, veterancy and recovering vehicles.",
    tags: ["retreat", "healing", "veterancy"],
    topics: ["unit_care"],
  },
  {
    slug: "economy",
    title: "Economy Tips",
    summary:
      "Game tips about resources: capturing territory, munitions and fuel, upkeep and command points.",
    tags: ["resources", "territory", "upkeep"],
    topics: ["economy"],
  },
  {
    slug: "visibility",
    title: "Line of Sight Tips",
    summary:
      "Game tips about vision: what blocks line of sight, spotting for long range units and using smoke.",
    tags: ["line of sight", "smoke"],
    topics: ["visibility"],
  },
  {
    slug: WIKI_FALLBACK_TIPS_PAGE,
    title: "Controls & Interface Tips",
    summary:
      "Game tips about giving orders: move and attack move, command groups, the command card and listening to your units.",
    tags: ["controls", "command card"],
    topics: ["controls"],
  },
  {
    slug: WIKI_FINAL_STAND_TIPS_PAGE,
    title: "Final Stand Tips",
    summary:
      "Game tips for the Final Stand mode: boss waves, perk points and how resources work there.",
    tags: ["final stand"],
    topics: [],
  },
];

/** The date the pages were added, the tips themselves follow the latest patch. */
const WIKI_TIPS_DATE = "2026-11-27";

const getIntro = (page: WikiTipPage) =>
  page.slug === WIKI_FINAL_STAND_TIPS_PAGE
    ? "The tips the game shows on the loading screens of Final Stand. The texts come straight from the game files of the latest patch."
    : "The tips the game shows on its loading screens, collected in one place. The texts come straight from the game files of the latest patch.";

/** The tip pages as wiki articles, registered in `WIKI_ARTICLES`. */
export const WIKI_TIP_ARTICLES: WikiArticle[] = WIKI_TIP_PAGES.map((page, index) => ({
  slug: page.slug,
  category: WIKI_TIPS_CATEGORY,
  title: page.title,
  summary: page.summary,
  // The texts are from the game, the site only collects them.
  authors: [{ name: "COH3 Stats" }],
  date: WIKI_TIPS_DATE,
  tags: ["game tips", ...page.tags],
  order: index + 1,
  contents: getIntro(page),
}));

export const isWikiTipsArticle = (article: Pick<WikiArticle, "category">) =>
  article.category === WIKI_TIPS_CATEGORY;

const PAGE_BY_TOPIC: Record<string, string> = Object.fromEntries(
  WIKI_TIP_PAGES.flatMap((page) => page.topics.map((topic) => [topic, page.slug])),
);

/** The slug of the page a tip is listed on. */
export const getWikiTipPageSlug = (tip: Pick<IngameTip, "topic" | "gameMode">): string => {
  if (tip.gameMode === FINAL_STAND_TIPS_GAME_MODE) return WIKI_FINAL_STAND_TIPS_PAGE;
  return PAGE_BY_TOPIC[tip.topic] ?? WIKI_FALLBACK_TIPS_PAGE;
};

/** The id of the tip on its page, for links like `/wiki/tips/combat#tip-tipcover1`. */
export const getWikiTipAnchor = (tip: Pick<IngameTip, "id">) => `tip-${tip.id}`;

/**
 * Link to the tip on its wiki page. `null` for a tip of another game mode than Final Stand - the
 * wiki doesn't list those, they are skipped by `buildWikiTipSections` too.
 */
export const getWikiTipHref = (tip: Pick<IngameTip, "id" | "topic" | "gameMode">) =>
  tip.gameMode === null || tip.gameMode === FINAL_STAND_TIPS_GAME_MODE
    ? `${getWikiRoute(WIKI_TIPS_CATEGORY, getWikiTipPageSlug(tip))}#${getWikiTipAnchor(tip)}`
    : null;

/** English names of the tip `category`s, the data file only has the ids. */
const TIP_CATEGORY_LABELS: Record<string, string> = {
  accuracy: "Accuracy",
  antiair: "Anti-Air",
  armor: "Armor",
  artillery: "Artillery",
  attackmove: "Attack Move",
  audio: "Audio Cues",
  barbedwire: "Barbed Wire",
  breach: "Breaching Buildings",
  bridge: "Bridges",
  capture: "Capturing",
  commandcard: "Command Card",
  commandpoints: "Command Points",
  controls: "Command Groups",
  cover: "Cover",
  crewshock: "Crew Shock",
  engineer: "Engineers & Pioneers",
  experience: "Experience",
  explosives: "Explosives",
  facing: "Facing",
  fire: "Flame Weapons",
  garrison: "Garrisons",
  grenades: "Grenades",
  groups: "Command Groups",
  health: "Health & Reinforcing",
  holdfire: "Hold Fire",
  indirect: "Indirect Fire",
  los: "Line of Sight",
  move: "Movement",
  perks: "Perk Points",
  prioritize: "Prioritize Vehicles",
  rangers: "Rangers",
  resources: "Resources",
  restore: "Recovering Vehicles",
  retreat: "Retreat",
  smoke: "Smoke",
  suppress: "Suppression",
  transport: "Transports",
  upkeep: "Upkeep",
  veterancy: "Veterancy",
  waves: "Waves & Bosses",
  weapons: "Weapon Pick-ups",
};

/** `"barbedwire"` -> `"Barbed Wire"`, a new category without a label -> its id in title case. */
export const getWikiTipCategoryLabel = (category: string): string =>
  TIP_CATEGORY_LABELS[category] ??
  (category
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ") ||
    WIKI_TIPS_MORE_LABEL);

/** The section for the categories with a single tip, at the end of the page. */
export const WIKI_TIPS_MORE_LABEL = "More Tips";
const WIKI_TIPS_MORE_ID = "more-tips";

export type WikiTip = Pick<IngameTip, "id" | "text"> & {
  /**
   * Ids of the tips left out for having the same text, so their links (`getWikiTipHref`) still
   * land on this tip. Only set when there are some.
   */
  aliases?: string[];
};

export type WikiTipSection = {
  /** The heading id, also used by the "On this page" list. */
  id: string;
  title: string;
  tips: WikiTip[];
};

const naturalCompare = (a: string, b: string) =>
  a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

/** `"Line of Sight"` -> `"line-of-sight"` */
const toSectionId = (label: string) =>
  label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * The tips of a page, split into sections by their `category`. The biggest sections go first, the
 * categories with a single tip are put together in "More Tips" at the end. Inside a section the
 * tips keep the numbering of the game (`tipcover2` before `tipcover10`). A tip with the same text
 * as one before it (the game has a few) is left out, its id is kept as an alias of that tip.
 */
export const buildWikiTipSections = (tips: IngameTip[], pageSlug: string): WikiTipSection[] => {
  const tipByText = new Map<string, IngameTip>();
  const aliases = new Map<string, string[]>();
  const byCategory = new Map<string, IngameTip[]>();

  for (const tip of tips) {
    if (tip.gameMode !== null && tip.gameMode !== FINAL_STAND_TIPS_GAME_MODE) continue;
    if (getWikiTipPageSlug(tip) !== pageSlug) continue;
    const text = tip.text.trim();
    if (!text) continue;
    const kept = tipByText.get(text);
    if (kept) {
      aliases.set(kept.id, [...(aliases.get(kept.id) ?? []), tip.id]);
      continue;
    }
    tipByText.set(text, tip);

    const label = getWikiTipCategoryLabel(tip.category);
    if (!byCategory.has(label)) byCategory.set(label, []);
    byCategory.get(label)?.push(tip);
  }

  const toWikiTips = (list: IngameTip[]): WikiTip[] =>
    [...list]
      .sort((a, b) => naturalCompare(a.id, b.id))
      .map(({ id, text }) =>
        aliases.has(id) ? { id, text, aliases: aliases.get(id) } : { id, text },
      );

  const sections: WikiTipSection[] = [];
  const singles: IngameTip[] = [];
  // Map keeps the order of the data file, the sort is stable, so that breaks the ties.
  for (const [title, list] of Array.from(byCategory.entries())) {
    if (list.length === 1 && byCategory.size > 1) singles.push(...list);
    else sections.push({ id: toSectionId(title), title, tips: toWikiTips(list) });
  }
  sections.sort((a, b) => b.tips.length - a.tips.length);

  if (singles.length > 0) {
    sections.push({
      id: WIKI_TIPS_MORE_ID,
      title: WIKI_TIPS_MORE_LABEL,
      tips: toWikiTips(singles),
    });
  }

  return sections;
};

/** How many tips each page lists, by page slug. */
export const countWikiTipsByPage = (tips: IngameTip[]): Record<string, number> =>
  Object.fromEntries(
    WIKI_TIP_PAGES.map((page) => [
      page.slug,
      buildWikiTipSections(tips, page.slug).reduce(
        (sum, section) => sum + section.tips.length,
        0,
      ),
    ]),
  );
