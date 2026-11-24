/** Tags that render as their own block, a paragraph is never wrapped around them. */
const BLOCK_TAGS = [
  "h1",
  "h2",
  "h3",
  "img",
  "list",
  "note",
  "code",
  "table",
  "hr",
  "quote",
  "p",
  "previewyoutube",
];

const blockOpening = new RegExp(`^\\[(${BLOCK_TAGS.join("|")})(?=[\\]\\s=])`, "i");

/**
 * Wiki articles are written with blank lines between paragraphs, like markdown. HTML ignores
 * line breaks, so the text between the block tags is wrapped in `[p]`. Lines of one paragraph
 * are joined with a space, block tags (and everything up to their closing tag) are kept as is.
 */
export const prepareWikiContents = (contents: string): string => {
  const lines = contents.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length > 0) {
      output.push(`[p]${paragraph.join(" ")}[/p]`);
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "") {
      flush();
      continue;
    }

    const match = line.match(blockOpening);
    if (!match) {
      paragraph.push(line);
      continue;
    }

    flush();
    const tag = match[1].toLowerCase();
    // [hr] has no closing tag.
    if (tag === "hr") {
      output.push(line);
      continue;
    }

    // Keep the block whole, nested tags of the same name are counted.
    const opening = new RegExp(`\\[${tag}(?=[\\]\\s=])`, "gi");
    const closing = new RegExp(`\\[/${tag}\\]`, "gi");
    const block: string[] = [lines[i]];
    let depth = (line.match(opening) || []).length - (line.match(closing) || []).length;
    while (depth > 0 && i + 1 < lines.length) {
      i++;
      block.push(lines[i]);
      depth += (lines[i].match(opening) || []).length - (lines[i].match(closing) || []).length;
    }
    output.push(block.join("\n"));
  }
  flush();

  return output.join("\n");
};
