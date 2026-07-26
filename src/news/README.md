# Local News

Local news articles are site-specific posts shown alongside Steam announcements on the home page carousel and the `/news` page.

## How to add a local news article

1. **Fork the repository** and create a branch for your change.
2. **Add the article** in [`src/news/data/local-news.ts`](./data/local-news.ts) as a new object at the **top** of the `localNews` array (newest first is easier to review).
3. **Add images** (if any) under `public/images/news/`.
4. **Test locally** with `yarn dev` and open the home page and `/news`.
5. **Open a Pull Request** against this repository describing the news item.

### Article fields

| Field      | Required | Description                                                                                                                                 |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `gid`      | Yes      | Unique id. **Must** start with `local-` (e.g. `local-announce-ladder-tournament`) so it does not collide with Steam news gids.              |
| `title`    | Yes      | Article title.                                                                                                                              |
| `author`   | No       | Displayed author name.                                                                                                                      |
| `date`     | Yes      | Unix timestamp in **seconds** (not milliseconds). Controls sort order (newest first).                                                       |
| `image`    | No       | Path to the thumbnail used in the home carousel (e.g. `/images/news/my-article.webp`). If omitted, the first `[img]` in `contents` is used. |
| `url`      | No       | External link (opens from the share icon on the news page).                                                                                 |
| `contents` | No       | Body in **BBCode** (same style as Steam news).                                                                                              |

### Example entry

```ts
{
  gid: "local-my-announcement",
  title: "My Announcement Title",
  author: "COH3 Stats",
  date: 1735689600, // unix seconds
  image: "/images/news/my-announcement.webp",
  url: "https://example.com",
  contents: `
[img]/images/news/my-announcement.webp[/img]

[p]Intro paragraph.[/p]

[h2]Section title[/h2]
[p]More details and a [url=https://example.com]link[/url].[/p]
`.trim(),
},
```

Useful BBCode tags: `[p]`, `[h2]`, `[h3]`, `[b]`, `[i]`, `[img]...[/img]`, `[url=https://...]...[/url]`, `[list]` / `[*]`.

### Date tip

You can generate a unix timestamp here https://www.unixtimestamp.com/

## Images

- **Location:** `public/images/news/`
- **Path in code:** `/images/news/<filename>.webp` (public folder root maps to `/`)
- **Format:** **`.webp` only**
- **Crop / size:**
  - Prefer a **landscape** image (roughly **16:9**).
  - Crop so the important subject is centered — the home carousel uses the image as a **cover** background, so edges may be clipped.
  - Keep files reasonably small (aim under ~200–300 KB when possible).
- Reference the same path in both the `image` field and, if you want it in the article body, an `[img]...[/img]` tag.

Example on disk:

```text
public/images/news/my-announcement.webp
```

## Checklist before opening a PR

- [ ] `gid` starts with `local-` and is unique
- [ ] `date` is unix time in **seconds**
- [ ] Images are `.webp` under `public/images/news/`
- [ ] Article looks correct on home news carousel and `/news`
- [ ] Pull Request opened on [cohstats/coh3-stats](https://github.com/cohstats/coh3-stats)

If you are unsure about content or timing, ask on [Discord](https://discord.gg/jRrnwqMfkr) before or with the PR.
