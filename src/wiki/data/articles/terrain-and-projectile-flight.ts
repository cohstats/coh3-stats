import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "terrain-and-projectile-flight",
  category: "combat",
  group: "accuracy",
  title: "Terrain, Shot Blockers & Projectile Flight",
  summary:
    "Hills don't stop shots but tiny fences do. How angle first, speed first and constant time projectiles fly, and the speed increment staircase.",
  author: "Tsuyara",
  date: "2026-11-23",
  tags: ["terrain", "shot blockers", "artillery", "mortars", "projectiles"],
  order: 4,
  series: { id: "accuracy-scatter", part: 4 },
  contents: `
[h2]Terrain, elevation, fake mountains and real fences[/h2]
[url=/wiki/combat/scatter]Scattered[/url] shots land in any obstacle or vehicle in the way. Infantry has no collision. Ironically, the [b]ground usually has no collision either[/b]. You are not safe behind a hill.

You are, however, safe behind real [b]shot blockers[/b]. A lot of them have very weird hitboxes. There is the famous rock in the river that blocks shots metres above it, but plenty of things are cursed the other way: they block shots well below them.

[img alt="Shots hitting an obstacle in a desert map" caption="Shot blockers stop scattered shots."]/images/wiki/terrain-and-projectile-flight/shot-blockers.webp[/img]

[img alt="A fence whose hitbox reaches far below it" caption="The real hitbox of a fence can reach far below the fence itself."]/images/wiki/terrain-and-projectile-flight/fence-hitbox.webp[/img]

So while the terrain itself is easy to shoot through, obstacles block all your shots and ruin your effort. Shooting through 40m of mountain? No problem. A tiny wooden fence? Built on pillars of stone reaching the Balrog.

There is also a "distance guaranteed before hit" setting, which lets projectiles pass through obstacles close to the shooter. Bazookas have it set to 0, which is why they seem more likely to hit cover right in front of them than any other weapon.

[h2]Projectile flight[/h2]
Direct fire weapons like most tank guns fly straight to their target at very high speed. Artillery and mortars arc instead, to give the opponent time to react (and maybe for the feel). The game does this in three ways.

[h3]Angle first[/h3]
The most common type. These weapons shoot at a constant angle and calculate the speed needed for it. This gives them excellent scaling at longer ranges, where the shot just gets faster and faster.

They also try to avoid shot blockers in the way. This makes them arc up to a limit set per weapon, often 89°. They can end up shooting straight up into the air with goofy results, but they avoid shooting into a house.

[h3]Speed first[/h3]
The rarest type, even though it sounds like the default. These weapons have a set speed and shoot at the lowest or highest angle that speed allows (usually the lowest). At long range this often means shooting at 45°. They do not try to avoid obstacles, but are often set to pierce through any obstacle until the shot gets close to the target.

[h3]The speed increment[/h3]
A small part, but it can matter. When the speed can't produce a valid angle (the projectile would always fall short of the chosen impact point), the speed isn't adjusted smoothly. Instead there is a set [b]speed increment[/b], which can be as high as 20m/s on weapons that start at 25m/s.

This creates a staircase effect: the projectile speeds up a lot at certain distances, where the speed jumps from 25m/s to 45m/s to 65m/s.

[img alt="Chart of projectile speed and travel time by distance" caption="Projectile speed and travel time by distance, with the speed jumping at each increment."]/images/wiki/terrain-and-projectile-flight/speed-and-travel-time.webp[/img]

[h3]Constant time[/h3]
This is just mortars, which always hit [b]3.125s[/b] after firing. Interestingly, they are not considered artillery and COULD use accuracy. Sadly their accuracy is set to 0, and even if it wasn't, they have no projectile homing, so they would snipe models but only stationary ones.
`.trim(),
};

export default article;
