# Wiki

Long form articles about the game, at `/wiki/<category>/<article>`. They are written in the code as BBCode, like the [local news](../news/README.md), and every page is built at build time.

## Structure

- `wiki-categories.ts`: the categories (`WIKI_CATEGORIES`), their sub-groups and the series (`WIKI_SERIES`). A category without articles is hidden from the wiki.
- `data/articles/<slug>.ts`: one file per article.
- `data/index.ts`: the list of all articles, register every new article here.
- `get-wiki.ts`: helpers for the pages (navigation, series, headings, reading time).
- `wiki-bbcode.ts`: turns the blank-line paragraphs into `[p]` before rendering.
- `screens/wiki/`: the pages and the layout (breadcrumbs, sidebar, "On this page").

## Adding an article

1. Create `src/wiki/data/articles/my-article.ts`:

```ts
import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "my-article", // the URL, unique in the whole wiki
  category: "combat", // one of WIKI_CATEGORY_SLUGS
  group: "accuracy", // optional, one of the category's groups
  title: "My Article",
  summary: "One or two sentences, shown on the cards and as the meta description.",
  author: "Your name",
  // authorUrl: "https://www.youtube.com/@channel", // optional, makes the author name a link
  date: "2026-11-23",
  // updated: "2026-12-01", // when the content changes
  // patch: "3.0.2", // the game patch, picked from updated / date and config.patches when empty
  tags: ["accuracy"],
  order: 1, // the order inside the group / category
  // series: { id: "accuracy-scatter", part: 5 }, // for multi part articles
  contents: `
Intro paragraph. Separate paragraphs with a blank line, no [p] needed.

[h2]Section[/h2]
Text with a [url=/wiki/combat/scatter]link to another article[/url].
`.trim(),
};

export default article;
```

2. Add it to `WIKI_ARTICLES` in `src/wiki/data/index.ts`.
3. Run `yarn test:windows __tests__/src/wiki`, the tests check slugs, categories, series numbers, list items, heading ids, images and internal links.

## BBCode

On top of the [news tags](../news/README.md):

| Tag                                                       | Renders                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `[h2]Title[/h2]`, `[h3]Title[/h3]`                        | A heading with an id, listed in "On this page". Keep them unique |
| `[img alt="..." caption="..."]/images/wiki/...[/img]`     | An image with a caption below it                                 |
| `[note title="TL;DR" color="yellow"]...[/note]`           | A callout box, `color` is any Mantine color, blue by default     |
| `[code]...[/code]`                                        | A block for formulas, keeps the line breaks                      |
| `[table][tr][th]..[/th][/tr][tr][td]..[/td][/tr][/table]` | A table                                                          |
| `[url=/wiki/...]` / `[url=https://...]`                   | Site links stay in the tab, external ones open a new tab         |

Close list items with `[/*]`. Blocks (`[h2]`, `[img]`, `[list]`, `[note]`, `[code]`, `[table]`) must start on their own line.

## Images

`public/images/wiki/<article-slug>/<name>.webp`. The same rules as for the news: `.webp` only, under ~300 KB. The first image of an article is used for its card and for Open Graph, unless `image` is set.

## Translations

The UI texts are in `public/locales/en/wiki.json`. The articles themselves are English only.
