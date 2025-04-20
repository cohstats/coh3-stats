// This is a file for helpers with <HEAD> tag on the site

import React from "react";
import nextI18NextConfig from "../next-i18next.config";
import config from "../config";

const _defaultKeywords = [
  "coh3",
  "coh3 stats",
  "coh3 statistics",
  "coh3 info",
  "coh3 data",
  "Company of Heroes 3",
];

/**
 * Generate keywords for the <HEAD> tag
 * @param keywords Try not to pass more than 5 tags
 */
const generateKeywordsString = (keywords: string[] = []) => {
  return keywords.concat(_defaultKeywords).join(", ");
};

const SUPPORTED_LANGUAGES = nextI18NextConfig.i18n.locales;

/**
 * Generates alternate language link elements for SEO
 * @param currentPath - The current path (usually from Next.js router's asPath)
 * @returns Array of alternate language link elements
 */
export const generateAlternateLanguageLinks = (currentPath: string): React.ReactNode => {
  return (
    <>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${config.SITE_URL}${lang === nextI18NextConfig.i18n.defaultLocale ? "" : `/${lang}`}${currentPath}`}
        />
      ))}
      <link
        key="x-default"
        rel="alternate"
        hrefLang="x-default"
        href={`${config.SITE_URL}${currentPath}`}
      />
    </>
  );
};
export { generateKeywordsString, _defaultKeywords };
