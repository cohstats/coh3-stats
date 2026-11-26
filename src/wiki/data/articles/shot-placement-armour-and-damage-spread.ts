import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "shot-placement-armour-and-damage-spread",
  category: "combat",
  group: "accuracy",
  title: "Damage Spread",
  summary: "SMGs and HMGs spread their damage over the whole squad.",
  authors: [{ name: "Tsuyara" }],
  date: "2026-07-05",
  patch: "3.0.3",
  tags: ["damage distribution", "machine guns"],
  order: 2,
  series: { id: "accuracy-scatter", part: 2 },
  contents: `
[h2]When weapons spread damage[/h2]
A really odd mechanic. Some weapons, particularly [b]SMGs and HMGs (but not LMGs)[/b], don't just shoot at the target they picked. They randomly pick a target in their [b]damage distribution area[/b], as long as it is within the unit's natural arc and in range. It does not let you hit targets beyond that.

This avoids killing their target, which would interrupt their burst and force them to acquire a new one, but it also makes them a lot worse at killing individual models, as they prefer to spread their damage.

[img alt="Damage spread area of a Vickers machine gun" caption="Rough visualization of a Vickers' damage spread area."]/images/wiki/shot-placement-armour-and-damage-spread/vickers-damage-spread.webp[/img]

Next: what happens when the accuracy roll fails, scatter.
`.trim(),
};

export default article;
