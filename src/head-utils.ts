// This is a file for helpers with <HEAD> tag on the site

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

export { generateKeywordsString, _defaultKeywords };
