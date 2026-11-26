import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "accuracy-and-target-size",
  category: "combat",
  group: "accuracy",
  title: "Accuracy, Target Size & Modifiers",
  summary:
    "Accuracy is a single roll multiplied by the target size, and a successful roll always hits. How accuracy modifiers stack and how incremental accuracy makes machine guns shred blobs.",
  authors: [{ name: "Tsuyara" }],
  date: "2026-07-05",
  patch: "3.0.3",
  tags: ["accuracy", "target size", "incremental accuracy", "modifiers", "cover"],
  order: 1,
  series: { id: "accuracy-scatter", part: 1 },
  contents: `
Accuracy and scatter in CoH3 are not one mechanic, but a stack of mechanics that interact in cursed ways. Accuracy rolls, target size, scatter, hitboxes, terrain, projectile arcs and damage distribution all matter. This series walks through all of them, starting with the accuracy roll itself.

[note title="TL;DR of the whole series"]
[list]
[*]Accuracy is the chance for a guaranteed hit, multiplied by the target size. A hit pierces any obstacle, enemy, tree etc. on its path and homes in on the target.[/*]
[*]If the accuracy roll fails, the shot scatters. Scattered projectiles can collide with obstacles, vehicles and buildings, but not infantry. Infantry can only be damaged by scattered shots through AoE.[/*]
[*]All modifiers are multiplicative, but scatter modifiers can be weird because the forward/backward scatter often reaches its cap easily.[/*]
[*]The ground is not solid, projectiles pass through it.[/*]
[*]You cannot shoot below most shot blockers, they will block you.[/*]
[/list]
[/note]

[h2]Accuracy[/h2]
This one is very straightforward. Accuracy is a percentage roll. If it succeeds, the target it rolled against is hit [b]no matter what[/b]. The bullet or projectile goes through any obstacle and even bends to hit.

Accuracy is multiplied by the enemy's [b]target size[/b]:
[code]hit chance = accuracy × target size × modifiers[/code]
A machine gun crew with a target size of 1.33 takes 33% more accuracy when shot at, while a Sherman with a target size of 20 gets hit 20x as often, or with 1900% more accuracy.

Artillery does not use accuracy. Weapons that have the artillery flag never track targets, they ignore accuracy completely. But if accuracy is listed for a weapon on COH3 Stats, there is a 99% chance it does actually use it.

[h2]Accuracy modifiers[/h2]
Modifiers are also very simple. They are all [b]multiplicative[/b], either 1+x or 1-x:
[code]+20% and +20% accuracy  → 1.2 × 1.2 = 1.44 → +44% accuracy
+20% and +20% harder to hit → 0.8 × 0.8 = 0.64 → -36% accuracy[/code]

For infantry, ignoring edge cases of going over a 100% chance to hit (which is worthless), this means that +20% accuracy from any source translates to roughly [b]+20% more DPS[/b] than you had before the buff, regardless of any other modifiers you already have. In the same way, -50% from shooting into cover is roughly -50% DPS no matter what accuracy you started with, unless it was above 100%.

That ignores getting super lucky or unlucky of course, CoH is very RNG. Got to play the odds.

[h2]Incremental accuracy[/h2]
This one is special because it is a bit weirder. Incremental accuracy ("Inc. Accuracy" on COH3 Stats) is a core mechanic used on a bunch of weapons. A lot of pintle, hull and coax MGs use it, particularly the non German ones (yes, the Italians figured this one out but didn't share).

It looks for every model around the target within the [b]incremental target area[/b] (shown on COH3 Stats, it is usually pretty big) and applies a multiplier for each of them. This is [b]exponential[/b]:
[code]accuracy multiplier = incremental modifier ^ (models in the area - 1)[/code]

[list]
[*]On weapons like the BAR it is fairly weak at 1.02, so against 12 models (two Grenadier squads) it is a modest [b]+24% accuracy[/b]. Still good.[/*]
[*]On machine guns it is a whopping 1.12, 12% per model. This stacks fast, against the same two Grenadier squads you get [b]+248% accuracy[/b], nearly 3.5x the base. Such a strong modifier easily goes over the cap, but it is all multiplicative with everything else.[/*]
[/list]

[note title="Don't forget the -1" color="yellow"]When doing the maths, subtract 1 from the number of models. Two Grenadier squads are 12 models, but the initial target does not count for incremental accuracy, so the BAR gets 1.02^11.[/note]

Next: Weapons that spread their damage.
`.trim(),
};

export default article;
