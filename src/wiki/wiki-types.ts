// Types of the wiki, see `src/wiki/README.md` for how to add an article.

export const WIKI_CATEGORY_SLUGS = [
  "basics",
  "combat",
  "veterancy",
  "economy",
  "ranked",
  "site",
] as const;

export type WikiCategorySlug = (typeof WIKI_CATEGORY_SLUGS)[number];

/** Icons are picked in `screens/wiki/components/wiki-category-icon.tsx`, src stays React free. */
export type WikiCategoryIcon = "book" | "crosshair" | "medal" | "coins" | "trophy" | "chart";

export type WikiGroup = {
  id: string;
  title: string;
};

export type WikiCategory = {
  slug: WikiCategorySlug;
  title: string;
  description: string;
  icon: WikiCategoryIcon;
  color: string;
  /** Sub-groups shown in the sidebar, in this order. Articles without a group go last. */
  groups?: WikiGroup[];
};

/** Articles split from one long post, shown as "Part x of y" with prev/next links. */
export type WikiSeries = {
  id: string;
  title: string;
};

export type WikiAuthor = {
  name: string;
  /** Optional link for the name, like the author's YouTube channel. Opens in a new tab. */
  url?: string;
};

export type WikiArticle = {
  /** URL part, unique within the whole wiki: /wiki/<category>/<slug> */
  slug: string;
  category: WikiCategorySlug;
  /** One of the category's `groups` ids. */
  group?: string;
  title: string;
  /** One or two sentences, used on the cards and as the meta description. */
  summary: string;
  /** One or more authors, in the order they are shown. */
  authors: WikiAuthor[];
  /** Publish date, YYYY-MM-DD */
  date: string;
  /** Last real content change, YYYY-MM-DD */
  updated?: string;
  /** Game patch the content applies to, e.g. "3.0.2". Picked from the `updated` / `date` when empty. */
  patch?: string;
  tags: string[];
  /** Sort order inside the group / category, lower first. */
  order: number;
  series?: { id: string; part: number };
  /** Site relative card / Open Graph image, the first [img] in the contents when empty. */
  image?: string;
  /** BBCode, see the README for the tags. */
  contents: string;
};

export type WikiHeading = {
  id: string;
  label: string;
  level: 2 | 3;
};
