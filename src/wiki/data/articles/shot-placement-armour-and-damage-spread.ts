import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "shot-placement-armour-and-damage-spread",
  category: "combat",
  group: "accuracy",
  title: "Shot Placement, Armour Arcs & Damage Spread",
  summary:
    "Accurate shots don't always hit centre mass, armour facing is based on arcs rather than the hitbox, and SMGs and HMGs spread their damage over the whole squad.",
  author: "Tsuyara",
  date: "2026-11-23",
  tags: ["armour", "rear armour", "hitbox", "damage distribution", "machine guns"],
  order: 2,
  series: { id: "accuracy-scatter", part: 2 },
  contents: `
[h2]Shooting at tanks[/h2]
Shots that pass the [url=/wiki/combat/accuracy-and-target-size]accuracy roll[/url] curve and bend reality to hit their target, but they do [b]not[/b] always aim at centre mass. A setting that is usually enabled makes the shot scatter around the unit's hitbox, to give a more natural feel instead of every shot landing in exactly the same spot.

[img alt="A shot hitting the side of a tank" caption="Accurate shots land somewhere on the hitbox, not always in the middle."]/images/wiki/shot-placement-armour-and-damage-spread/shot-placement.webp[/img]

[h2]Armour layout[/h2]
[note title="Changed in patch 3.0" color="yellow"]This section describes how armour facing worked before 3.0. It was changed in 3.0, a full article on the new system will follow.[/note]

Armour is not based on the unit's hitbox at all. It is entirely based on [b]arcs around the unit[/b]. This means longer units tend to have less side armour, with it replaced by front and rear.

[img alt="Diagram of front, side and rear armour arcs" caption="Armour arcs: the corners of a long hull belong to the front and rear arcs, leaving less side."]/images/wiki/shot-placement-armour-and-damage-spread/armour-arcs.webp[/img]

So with a weird shot placement, one can hit the rear of a tank from nearly in front. You can also do this with elevation or depression, by being above or below the target. Sadly they can usually do it to you too.

[list]
[*]Avoid having your tank point above or below enemies, as awkward as that may be. It increases the risk of rear hits from the front.[/*]
[*]If you know the enemy dies to 1 rear shot but needs 2 side or front shots, you can ground attack the rear from the side and hope for the best.[/*]
[*]Medium tanks and heavier take [b]33.3334% extra damage[/b] from rear shots. Light tanks, light vehicles etc. do not.[/*]
[/list]

[h2]When weapons spread damage[/h2]
A really odd mechanic. Some weapons, particularly [b]SMGs and HMGs (but not LMGs)[/b], don't just shoot at the target they picked. They randomly pick a target in their [b]damage distribution area[/b], as long as it is within the unit's natural arc and in range. It does not let you hit targets beyond that.

This helps them not interrupt their burst when the target dies and they have to acquire a new one, but it also makes them a lot worse at killing individual models, as they prefer to spread their damage.

[img alt="Damage spread area of a Vickers machine gun" caption="Rough visualization of a Vickers' damage spread area."]/images/wiki/shot-placement-armour-and-damage-spread/vickers-damage-spread.webp[/img]

Next: what happens when the accuracy roll fails, scatter.
`.trim(),
};

export default article;
