const EXCERPT_LENGTH = 160;

/**
 * Plain text start of an article for the meta description, without the BBCode.
 * Image and video tags are dropped whole, their content is a URL, not text.
 */
const getNewsExcerpt = (contents?: string, maxLength = EXCERPT_LENGTH): string => {
  const text = (contents ?? "")
    .replace(/\[img[^\]]*\][\s\S]*?\[\/img\]/gi, " ")
    .replace(/\[previewyoutube[^\]]*\][\s\S]*?\[\/previewyoutube\]/gi, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\s+/g, " ")
    // A closing tag before punctuation, `[/url].`, must not leave `notes .`.
    .replace(/ ([.,!?;:])/g, "$1")
    .trim();

  // By code point, so an emoji at the cut isn't split into half a surrogate pair.
  const characters = Array.from(text);
  if (characters.length <= maxLength) return text;

  const cut = characters.slice(0, maxLength - 1).join("");
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

export { getNewsExcerpt };
