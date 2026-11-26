import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "scatter",
  category: "combat",
  group: "accuracy",
  title: "Scatter, Scatter Offset & Ground Attacks",
  summary:
    "What happens when a projectile misses: the scatter area, its cap, the offset behind the target, and why you should ground attack in front of the spot you want to hit.",
  authors: [{ name: "Tsuyara" }],
  date: "2026-07-05",
  patch: "3.0.3",
  tags: ["scatter", "artillery", "ground attack", "offset", "modifiers"],
  order: 3,
  series: { id: "accuracy-scatter", part: 3 },
  contents: `
[h2]Scatter basics[/h2]
Scatter is what happens when a projectile weapon [b]fails its accuracy roll[/b]. For non-projectile weapons (like rifles) scatter is purely visual, they cannot hit anything there, and the scatter values are used for the [url=/wiki/combat/shot-placement-armour-and-damage-spread]damage distribution[/url] instead.

Scatter has several components. In principle it is an [b]angle[/b] from side to side and a [b]ratio[/b] for the distance forward and back. The ratio is usually capped, the side to side angle is not. COH3 Stats shows the area as a square, but in truth it is a portion of an annulus (a ring). The square is more intuitive and a solid approximation. The side to side metres shown are the width in the middle.

Scattered projectiles can still collide with vehicles and buildings. Infantry, however, has no projectile collision, so scattered shots only damage infantry through AoE splash.

Notably, scatter is not centred on the middle of the hitbox. It often scatters around whichever side is facing you.

[img alt="Scatter area next to a tank" caption="The scatter area is placed around the side of the target facing the shooter."]/images/wiki/scatter/scatter-facing-side.webp[/img]

[h2]Scatter modifiers[/h2]
Just like accuracy, every scatter modifier is multiplicative with everything else. Because of the cap, fog of war multipliers specifically often only affect the side to side scatter, since the forward/back scatter hits the cap regardless.

[img alt="Scatter area around a tank" caption="Scatter area of shots at a tank."]/images/wiki/scatter/scatter-area.webp[/img]

[h2]Scatter offset and overshooting[/h2]
A lot of scatter has an [b]offset[/b]: instead of being centred on the target the weapon picked, it is centred [b]behind[/b] it. This helps more shots hit vehicles, because vehicles have hitboxes. It is also why you will often want to ground attack behind vehicles rather than on them.

Against infantry this usually lowers your damage. It can help hit targets moving away from you, but hurts against stationary ones or ones moving towards you.

[img alt="Scatter area behind an infantry target" caption="With an offset the scatter area sits behind the target."]/images/wiki/scatter/scatter-offset.webp[/img]

Hot tip: if the enemy isn't ground attacking, a great way to dodge a Brummbär shot is to run [i]into[/i] the Brummbär. It may be wise to run away afterwards though, the next one probably won't miss.

This matters for ground attacks too, especially with units like the Brummbär: aim [b]in front of[/b] the spot you actually want to hit.

[h2]How the spot is picked[/h2]
Scatter is not as simple as "the weapon scatters around the target". It scatters around the [b]X/Y coordinates[/b] of the target. The game first picks a spot on the ground and then shoots [i]at[/i] that spot, rather than shooting and letting the projectile land wherever it lands.

[img alt="Scatter area projected over a cliff" caption="The scatter area is picked on the ground's X/Y plane, no matter the height."]/images/wiki/scatter/scatter-ground-position.webp[/img]

Next: terrain, shot blockers and how artillery projectiles fly.
`.trim(),
};

export default article;
