import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "territory-capture-tactics",
  category: "economy",
  group: "territory",
  title: "Territory Capture Principles & Tactics",
  summary:
    "Which unit should capture, why spreading out beats stacking on a point, cutting off enemy resources, and how to keep combat units fighting while support units take the ground.",
  authors: [{ name: "tightrope", url: "https://www.youtube.com/@tightropegaming" }],
  date: "2025-08-03",
  updated: "2026-11-26",
  tags: ["territory", "capture", "revert", "cutoff", "experience", "resources"],
  order: 2,
  series: { id: "territory-capture", part: 2 },
  contents: `
Part 2 of the written version of tightrope's video [url=https://www.youtube.com/watch?v=Mb_8pKNOqL0]Learn how to capture territory like a pro in COH3[/url]. Updated to match patch 3.0.3. It uses the capture times and rates from [url=/wiki/economy/territory-capture-rates]part 1[/url].

[note title="TL;DR"]
[list]
[*]Several units in the same circle don't capture faster. Spread out to take more points at once.[/*]
[*]Capture with the fast capturers, unless they are expensive combat units or far away.[/*]
[*]Some units gain experience from captures and reverts, so let them capture where you can.[/*]
[*]Taking one strategic point can cut off a whole chunk of the enemy's territory, much faster than reverting each point.[/*]
[*]Keep combat units pushing and hand the capture to a nearby support or wounded unit.[/*]
[/list]
[/note]

[h2]Capture principles[/h2]
[h3]Spread out[/h3]
Having more units in the same circle does [b]not[/b] make the capture go faster. If you want to gain ground quickly, spread your units out over different points.

[h3]Pick the right unit[/h3]
Prioritize the units with faster capture rates, but there are exceptions. Rangers have a great capture rate, but they are expensive and valuable in combat. It can be better to capture with an Engineer squad instead, even though it only has a capture rate of 1.

[img alt="An engineer squad and a ranger squad with their capture rates and costs" caption="Engineers: 180 manpower and 4 pop. Rangers: 450 manpower and 14 pop. The Rangers capture faster, but are too valuable to spend on it."]/images/wiki/territory-capture-tactics/engineer-vs-rangers.webp[/img]

If a unit with a good capture rate is far away, it is usually better to capture with whatever is closest.

Fast units like the Kettenkrad or Bersaglieri cut down the travel time between points, which also leads to faster territory gains.

[h3]Mind the retreat path[/h3]
If a unit capturing deep on the enemy's side of the map has to retreat, there is a high chance it gets killed before it makes it back to base.

[h2]Experience from capturing[/h2]
Some units gain experience whenever they complete a capture or a revert. Where it is practical, capture with these units to help them gain veterancy.

[img alt="The units that gain experience from capturing, grouped by faction" caption="The units with this ability, by faction. The British have none."]/images/wiki/territory-capture-tactics/capture-xp-units.webp[/img]

They are the Scouts, Pathfinders, Weasel and 4x4 for US Forces, the Kettenkrad for the Wehrmacht and the Kradschützen for the Afrikakorps. The British have [b]none[/b]. In patch 3.0.3, a capture and a revert both give 75 experience.

[h2]Cutting off resources[/h2]
Resource points have to be connected to your base to generate income. On many maps, capturing one strategic point on the enemy's side disconnects a large chunk of their territory and severely hurts their income.

[img alt="The tactical map with an enemy strategic point that cuts off three resource points" caption="Reverting the one strategic point takes 15 seconds and cuts off all three points behind it."]/images/wiki/territory-capture-tactics/resource-cutoff.webp[/img]

A strategic point takes only [b]15 seconds[/b] to revert, so a cutoff is much faster than reverting the points downstream one by one. In tightrope's example, the three points behind it are a low, a high and a medium point, which take 15 + 35 + 25 = 75 seconds to revert at a rate of 1.

[note title="Mismatch in the video" color="orange"]The video's overlay gives the total as "65 seconds", but its own revert times (15, 35 and 25 seconds) add up to 75 seconds.[/note]

[h2]Capture tactics[/h2]
[h3]Partially captured points[/h3]
You will often force an enemy off a point before they finish capturing it. Entering that point with a unit with a revert rate above 1 undoes their progress faster.

[img alt="Three versions of a partially captured point: auto revert, revert rate 1 and revert rate 1.25" caption="Auto revert, a revert rate of 1, and a revert rate of 1.25 (the last two at 2x speed)."]/images/wiki/territory-capture-tactics/revert-rates-compared.webp[/img]

Revert rates above 1 are much rarer than capture rates above 1, though. If the enemy had a lot of progress, tightrope keeps pushing forward and lets the point tick down to neutral on its own. Then tightrope gives the capture order to a more support oriented unit nearby, so the combat unit doesn't waste time.

[h3]Capture with idle support weapons[/h3]
After pushing an enemy off a point on your side of the map, keep pushing up the map with the attacking unit to take more territory. Give the capture order to a unit like a mortar. The area is now safe, and you may not know where the enemy is, so the mortar has nothing to shoot at anyway.

[img alt="A mortar team capturing a point behind the front line" caption="Push with the attacking unit, capture with the idle support weapon."]/images/wiki/territory-capture-tactics/capture-with-support-weapon.webp[/img]

[h3]Leave the wounded unit behind[/h3]
With several units in an area, send the healthy ones forward to keep attacking and leave the wounded one behind to capture. Then queue a retreat on it with [b]Shift + R[/b], so it goes back to base to reinforce as soon as the capture is done.

[img alt="A wounded Royal Engineer section capturing with a queued retreat" caption="Queue the retreat with Shift + R so the wounded unit leaves as soon as it finishes."]/images/wiki/territory-capture-tactics/queued-retreat.webp[/img]

[h3]The opening[/h3]
At the start of a match, connecting fuel is usually the most important, because it lets you tech up and build vehicles.

[img alt="The tactical map with the fuel points circled" caption="Connecting fuel is usually the first priority."]/images/wiki/territory-capture-tactics/fuel-priority.webp[/img]

On some maps, it can be better to rush to a spot and build defenses or take a garrison. That gives better control of the area for the first few minutes, and more resources in the long run.

[img alt="A pioneer squad at a building early in the match" caption="An early door wire-off can be very powerful."]/images/wiki/territory-capture-tactics/early-wire-off.webp[/img]
`.trim(),
};

export default article;
