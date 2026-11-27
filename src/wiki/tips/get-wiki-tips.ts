/**
 * Server side part of the "Game Tips" wiki pages - downloads the tips, use it in `getStaticProps`.
 */

import config from "../../../config";
import { getIngameTips } from "../../explorer/ingame-tips/ingame-tips";
import { buildWikiTipSections, countWikiTipsByPage, WikiTipSection } from "./wiki-tips";

export type WikiTipsPageData = {
  sections: WikiTipSection[];
  tipCount: number;
  /** The patch the tips are from, always the latest one. */
  patch: string;
};

/**
 * The tips of a page in the given language, from the latest patch. `null` when the tips data can't
 * be downloaded - the page then says so instead of failing the build.
 */
export const getWikiTipsPage = async (
  slug: string,
  locale: string,
): Promise<WikiTipsPageData | null> => {
  const data = await getIngameTips({ locale });
  if (!data) return null;

  const sections = buildWikiTipSections(data.tips, slug);
  return {
    sections,
    tipCount: sections.reduce((sum, section) => sum + section.tips.length, 0),
    patch: config.latestPatch,
  };
};

/** How many tips each page lists, by page slug, `null` without the tips data. */
export const getWikiTipCounts = async (
  locale: string,
): Promise<Record<string, number> | null> => {
  const data = await getIngameTips({ locale });
  return data ? countWikiTipsByPage(data.tips) : null;
};
