import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "territory-capture-micro-tips",
  category: "economy",
  group: "territory",
  title: "Territory Capture Micro Tips",
  summary:
    "Queue captures so squads leave the circle on the right side, drag commands for vehicles, capturing from cover, building defenses, repairing while capturing and when to attack move onto a point.",
  authors: [{ name: "tightrope", url: "https://www.youtube.com/@tightropegaming" }],
  date: "2025-08-03",
  updated: "2026-11-26",
  tags: ["territory", "capture", "micro", "queue", "hotkeys", "sandbags"],
  order: 3,
  series: { id: "territory-capture", part: 3 },
  contents: `
Part 3 of the written version of tightrope's video [url=https://www.youtube.com/watch?v=Mb_8pKNOqL0]Learn how to capture territory like a pro in COH3[/url]: micro tips to capture territory more efficiently. Updated to match patch 3.0.3.

[note title="TL;DR"]
[list]
[*]Right click the edge of the circle nearest the next point, then Shift + right click the flag. The squad reaches the next point about 4 seconds sooner.[/*]
[*]For vehicles, right click and drag towards the next point so they don't have to turn around.[/*]
[*]A squad in cover on a point stays in that cover while it captures.[/*]
[*]You can't build while capturing. Decide which to do first.[/*]
[*]You can still repair while capturing.[/*]
[*]Attack move long range squads onto points where enemies could be, capture order close range squads.[/*]
[/list]
[/note]

[h2]Queue captures from the right side[/h2]
The normal way to capture at the start of the game is to queue capture commands on the minimap or tactical map, holding [b]Shift[/b] and right clicking the points in the order you want them captured.

[img alt="The tactical map with four points numbered in capture order" caption="Hold Shift and right click the points to queue the captures."]/images/wiki/territory-capture-micro-tips/shift-queue.webp[/img]

With commands like this, the squad moves into the circle and stands on the side it arrived from. It only starts to move to the next point once the capture is complete, so it then has to walk through the circle. That takes about [b]4 seconds[/b], which is essentially wasted.

[img alt="A squad leaving the capture circle with a timer at about 4 seconds" caption="Walking back through the circle after the capture took about 4 seconds."]/images/wiki/territory-capture-micro-tips/capture-exit-delay.webp[/img]

Do this instead:
[list]
[*]Right click the [b]edge of the capture circle[/b] on the side closest to the next point you want to capture.[/*]
[*]Hold Shift and right click the capture flag.[/*]
[*]Keep holding Shift and right click the next circle's edge the same way, then its flag, and so on.[/*]
[/list]

[img alt="A right click on the far edge of the capture circle" caption="Right click the edge of the circle on the side of the path to the next point."]/images/wiki/territory-capture-micro-tips/edge-right-click.webp[/img]

The unit doesn't have to cross the circle after the capture, so it arrives at the next point about 4 seconds earlier. tightrope recommends it at the start of the game, when there is nothing else to micro.

[h3]For vehicles[/h3]
For vehicles that capture, like the Kettenkrad, target the same spot on the circle edge, but [b]hold right click and drag[/b] towards the next point to set the facing. Then queue the following capture orders.

[img alt="A right click drag command for a Kettenkrad on the edge of the circle" caption="Right click drag so the vehicle already faces the next point."]/images/wiki/territory-capture-micro-tips/vehicle-drag.webp[/img]

The vehicle can drive straight to the next point once the capture is complete. It doesn't get slowed down by turning first, or worse, by driving around the capture flag to get to the next point.

[h2]Capturing from cover[/h2]
The trick above works because squads stop on the side of the point they come from. It also means you can move your squad into cover on a point, queue a capture on it and then on the next point, and the squad [b]stays in cover[/b] the whole time it captures.

[img alt="A pioneer squad moving into cover inside a capture circle" caption="Move into cover first, then queue the capture: the squad stays put while capturing."]/images/wiki/territory-capture-micro-tips/capture-from-cover.webp[/img]

[note title="Capture behaviour"]Squads given a capture command from outside a point don't stack onto the centre: they move to the point and stop on the side they come from. Squads already in a point's zone don't move closer when given a capture command, and with a queued order they hold their position, capture, and then move to the next order.[/note]

[h2]Building defenses on points[/h2]
This makes cover like sandbags built inside capture circles much more powerful, since it is now much easier to use it while capturing. But units [b]can't capture and build at the same time[/b]. The capture is paused until the construction is complete.

[img alt="A pioneer squad placing a sandbag wall in a capture circle" caption="Building pauses the capture."]/images/wiki/territory-capture-micro-tips/sandbags.webp[/img]

How tightrope adapts:
[list]
[*]If the point is in a [b]safe area[/b], queue the defenses [b]after[/b] the capture, so the resources start flowing as early as possible.[/*]
[*]If you may be attacked while capturing and there is no good cover nearby, [b]build first[/b]. It delays the capture, but makes the point harder for the enemy to push, so you are more likely to finish the capture and take less damage doing it.[/*]
[/list]

[h2]Repairing while capturing[/h2]
You can still repair vehicles while capturing, so look for chances to do it safely. This also works with self-repair on units like the Kradschützen: back capping a safe point while it repairs is a very efficient play. Self-repair ends as soon as the unit enters combat or takes damage, so pick a point that really is safe.

[img alt="Kradschützen capturing a point with the Self-repair tooltip" caption="Self-repair while back capping a safe point."]/images/wiki/territory-capture-micro-tips/self-repair.webp[/img]

[h2]Keep queuing all game[/h2]
Queuing capture commands stays important all game. You may get stuck microing a fight that takes all your attention, and units without queued commands just sit idle instead of moving up the map and capturing.

[h2]Attack move or capture order[/h2]
If you are capturing a point where enemies could be, change the type of command for the unit.

Give a [b]long range[/b] squad, like a Bren upgraded Infantry Section, an [b]attack move[/b] onto the point. As soon as it spots an enemy, it stops at max range and starts shooting. Before you even notice the fight, the squad is fighting at its best range and taking little damage. With a capture order, the same squad would charge into close range and probably have to retreat.

[img alt="A Bren Infantry Section given an attack move onto a point" caption="Attack move long range squads, so they stop at max range when they spot an enemy."]/images/wiki/territory-capture-micro-tips/attack-move-bren.webp[/img]

A [b]close range[/b] squad, like Thompson Gurkhas, wants to charge in, so a normal capture command is better for it.
`.trim(),
};

export default article;
