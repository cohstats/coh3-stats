import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "rate-of-fire-vs-attack-speed",
  category: "combat",
  group: "firing",
  title: "Rate of Fire vs Overall Attack Speed",
  summary:
    "CoH3 has two different modifiers that are both called rate of fire. One only shortens cooldown and reload, the other almost the whole firing cycle, and neither touches the burst.",
  author: "Tsuyara",
  date: "2026-11-23",
  tags: ["rate of fire", "attack speed", "veterancy", "machine guns", "dps"],
  order: 2,
  series: { id: "firing-cycles", part: 2 },
  contents: `
There are two modifiers and the naming gets weird, but let's go. If you are not sure what aim time, wind down or cooldown mean, read [url=/wiki/combat/weapon-firing-cycle]The Weapon Firing Cycle[/url] first.

[h2]+Rate of fire[/h2]
This is the old modifier and it [b]only affects cooldown and reload[/b]. +25% rate of fire means -25% cooldown and reload.

How much it does varies a lot from unit to unit. It depends on how long the weapon spends cooling down and reloading compared to winding up/down, aiming and bursting.

It is solid on tank guns, which generally have a short 0-0.125s aim and a 0.875s wind down. A Hellcat with a refire time of 6.5s spends 5.375s of it actually reloading.

[note title="Rule of thumb"]Tank guns, AT guns and similar: a reliably good increase. Anything else? Complete gamble.[/note]

[h2]Overall attack speed[/h2]
The new modifier, introduced in patch 2.2. It modifies [b]fire aim time (not ready aim time), wind up, wind down, cooldown AND reload[/b]. So nearly the whole firing cycle.

Sadly, it is ALSO often called "+rate of fire" in game, to make things confusing. Generally any unit reworked or added since 2.2 should use this one instead of the old one (for example the generalist medium tanks were reworked and now use attack speed). Except then they add something like the Siege Camp, which uses the old one for some reason, and is therefore useless on the Nebelwerfer: it has 0 cooldown and reload, its rate of fire is entirely wind up and wind down.

[h3]It doesn't affect the burst[/h3]
Attack speed does [b]not[/b] affect the burst duration. It reduces the time between bursts, but the more time a unit already spends bursting, the less it helps. Machine guns in particular shoot for a long time with short breaks, so even +50% attack speed is only about [b]+17% DPS for a Vickers[/b].

Even +100% attack speed would give a Vickers only about +46% DPS. That is the cap no matter how long the burst gets, because even an endlessly bursting Vickers is only 46% stronger than the default one.

[h3]+50% means half the time[/h3]
Attack speed works the same way as rate of fire by reducing those durations, so +50% attack speed halves the time between shots or bursts. It still doesn't affect the static 1 tick waits, so a tiny bit less. That is more like [b]+100% DPS[/b] than +50%.

A tip on the naming trap: because attack speed is really a [i]time[/i] modifier, a debuff of "-33% attack speed" stored as a 0.67 multiplier actually makes the unit shoot [i]faster[/i]. Even the developers have fallen into that one.

[h2]Same wording, wildly different results[/h2]
[h3]Example A: rate of fire often barely matters[/h3]
Gurkha veterancy gives +25% and +15% rate of fire. Old style rate of fire on a rifle squad does very little:

[img alt="Gurkha DPS at vet 0 and with +25% +15% rate of fire" caption="Gurkha Rifles DPS by distance, vet 0 vs +25% and +15% rate of fire."]/images/wiki/rate-of-fire-vs-attack-speed/gurkha-veterancy-rate-of-fire.webp[/img]

The same with a hypothetical +20% and +15% attack speed (they love to take 5% off):

[img alt="Gurkha DPS with rate of fire vs a hypothetical attack speed buff" caption="+36% rate of fire vs a hypothetical +32% attack speed on Gurkha Rifles."]/images/wiki/rate-of-fire-vs-attack-speed/gurkha-veterancy-attack-speed.webp[/img]

[h3]Example B: burst weapons scale poorly even with attack speed[/h3]
[img alt="Vickers DPS with +50% attack speed" caption="Vickers machine gun team with +50% attack speed. For the Vickers +50% rate of fire is identical."]/images/wiki/rate-of-fire-vs-attack-speed/vickers-attack-speed.webp[/img]

[h2]What should get rate of fire buffs?[/h2]
Sadly there is no easy answer. AT guns and tanks are always great. Infantry should now mostly be fine, targeted rate of fire increases use the modern system. Avoid machine guns.

The next part shows real buffs that were moved from rate of fire to attack speed and what that did.
`.trim(),
};

export default article;
