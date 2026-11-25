import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "weapon-firing-cycle",
  category: "combat",
  group: "firing",
  title: "The Weapon Firing Cycle",
  summary:
    "Every shot in CoH3 goes through aim time, wind up, burst, wind down and cooldown or reload. Here is what each step does and why the 8 ticks per second matter.",
  authors: [{ name: "Tsuyara" }],
  date: "2026-06-01",
  tags: ["rate of fire", "aim time", "cooldown", "reload", "dps"],
  order: 1,
  series: { id: "firing-cycles", part: 1 },
  contents: `
Rate of fire and all its chaos, explained for those insane enough to survive its curse. This first part covers what a weapon actually does between two shots. The next parts cover the two different "rate of fire" modifiers and what they mean in real games.

[note title="TL;DR"]
[list]
[*]A unit's firing cycle is made up of [b]aim time → wind up → burst → wind down → cooldown/reload[/b].[/*]
[*][b]+Rate of fire[/b] modifies only cooldown and reload.[/*]
[*][b]Attack speed[/b] modifies aim time (not the first shot one), wind up, wind down, cooldown and reload.[/*]
[*]Attack speed is sometimes called attack speed and sometimes called rate of fire, to make everything confusing.[/*]
[*]Because of all this, "+50% rate of fire" can mean anything from "barely noticeable" to "nearly double DPS".[/*]
[/list]
[/note]

[h2]A unit's firing cycle[/h2]
[code]ready aim time / fire aim time → wind up → shooting (burst) → wind down → +1 tick → cooldown / reload[/code]

[img alt="Firing cycle breakdown of several weapons" caption="How long each weapon spends in each step of its firing cycle, in seconds."]/images/wiki/weapon-firing-cycle/firing-cycle-breakdown.webp[/img]

[h3]Aim time[/h3]
The game uses the terms "ready aim time" and "fire aim time". [b]Ready aim time[/b] is used for the first shot on a model and is a range that can be affected by distance.

[b]Fire aim time[/b] is used for every following shot. Any interruption during any part of the unit shooting, like the model dying, resets it back to ready aim time. Fire aim time is also a range that changes by distance, based on the same factors.

Sometimes fire aim time is longer than ready aim time, at which point it is, in fact, a DPS gain to interrupt the unit...

[note title="Patch 2.4" color="yellow"]Before 2.4 the distance modifier for aim time only affected fire aim time, not ready aim time. Since then it affects both. No, this was not documented.[/note]

[h3]Wind up[/h3]
Static and unchanged by distance. This one is not too common, mortars use it to load a round into the gun, and a few weapons like flamethrowers or the 17 pounder have it too. Small quirk: if the wind up is above 0, there is an additional 0.125s (1 tick) wait once it is over. It makes the 17 pounder shooting look beyond goofy if you slow it down.

[h3]Shooting / burst[/h3]
For a single shot weapon this acts as a burst of 0.125s. It cannot be shorter than that and always takes at least 1 tick. For burst weapons this is their burst duration, which is a range and can change by distance.

[h3]Wind down[/h3]
Incredibly common, most guns have it. It can represent anything from cycling the bolt, ducking after an AT gun shot, a tank barrel recoiling, etc. Also static and unchanged by range.

[h3]The extra tick[/h3]
A static tick (0.125s) that is not changed by anything. Generally not super relevant. The documentation says this is the unit requesting to fire, but for some reason it happens between wind down and cooldown/reload.

[h3]Cooldown and reload[/h3]
Both can be ranges and both can change based on distance, but reload is usually set to be the same no matter how far away the enemy is.

Reload timing is based on the number of cooldown cycles, not directly on the number of bullets fired. When a reload happens, it [b]replaces[/b] the cooldown in the cycle rather than being added after it. So on some units, like Fallschirmjäger, who have a shorter reload than their cooldown, reloading is actually a DPS gain. Weird stuff.

[h2]Ticks: why small changes can do nothing[/h2]
The game runs at [b]8 ticks per second[/b] and most things only happen on a tick. If you reduce a cooldown, but not by enough to reach an earlier tick, it does nothing. Most durations are long enough for this not to matter, but there are exceptions.

Case in point, the [b]Crusader AA[/b]: it has 0 aim, wind up and wind down, and a 0.25s cooldown. That would in theory give it 4 shots a second, but because of the 1 tick wait and the 1 tick of shooting, a cycle takes 0.5s, so 2 shots per second. That is how it is balanced, but it is good to know when doing the maths!

Because the cooldown is so short, its veterancy +20% rate of fire doesn't change the time between shots at all. It only reduces the cooldown to 0.2s, which is not enough to save a tick. It still affects its reload as normal though.

[h2]One more cursed detail: idle animations[/h2]
Infantry will often play random animations while waiting for the cooldown and similar. These can delay their next shot a lot. They don't leave cover, but they play a look around (or similar) animation, probably to make combat more fun to watch. Team weapons and vehicles are not affected. There is no good way to account for this in DPS calculations, so keep it in mind when the real fight looks slower than the numbers.

Next: how the two "rate of fire" modifiers change this cycle.
`.trim(),
};

export default article;
