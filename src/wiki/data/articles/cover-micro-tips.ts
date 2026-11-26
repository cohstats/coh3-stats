import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "cover-micro-tips",
  category: "combat",
  group: "cover",
  title: "Cover Micro Tips",
  summary:
    "Capturing from cover, spreading out fast, chasing retreating units, cover for vehicles.",
  authors: [
    { name: "tightrope", url: "https://www.youtube.com/@tightropegaming" },
    { name: "Tsuyara" },
  ],
  date: "2026-03-14",
  updated: "2026-11-25",
  tags: ["cover", "micro", "retreat", "capture", "team games"],
  order: 5,
  series: { id: "cover", part: 5 },
  contents: `
A set of practical cover tricks.

[h2]Capture in cover[/h2]
When capturing a point, you can sometimes send the squad partly into cover outside the capture circle. Depending on the squad's formation and the cover, this can work right away.

If not, right click the squad into the cover and press [b]stop[/b] before the models leave the circle. The cover shield won't show for the squad, but the models in cover are still protected.

[img alt="A squad capturing with one model in the circle and one in cover" caption="One model in the capture circle, one model in cover."]/images/wiki/cover-micro-tips/capture-in-cover.webp[/img]

You now have a model or two in cover from the direction the enemy is most likely to attack, while the squad keeps capturing. That is extra durability at the start of a fight without giving up map control.

[h2]Spread out faster[/h2]
When a squad is bunched up in cover and needs to spread out quickly, for example to dodge a grenade, where you click matters:

[list]
[*]About [b]5 range[/b] from the cover the formation stays as bunched up as in cover.[/*]
[*]About [b]10 range[/b] away the squad spreads into its normal formation. This is the best spot.[/*]
[*]A [b]far away[/b] click is bad: the squad only starts spreading out about 20 range from the cover, and gradually.[/*]
[/list]

[img alt="Squads spreading out after 10 range and far away clicks" caption="A click about 10 range away spreads the squad out fastest."]/images/wiki/cover-micro-tips/spread-out-click.webp[/img]

Different formations leave cover in different orders, so this works better for some squads than others. Also give the move order onto [b]open ground[/b]. If it is onto another piece of cover, the squad can stay bunched up.

[h2]Cover on retreat[/h2]
Does cover protect retreating units? tightrope tested it with a mod that gave a weapon zero accuracy against light cover. While the retreating squad crossed light cover it took no damage, and as soon as it left the cover it started taking damage again. [b]Cover protects retreating units.[/b]

[img alt="A retreating squad crossing craters under fire" caption="Test with a weapon modded to have 0 accuracy against light cover."]/images/wiki/cover-micro-tips/retreat-test.webp[/img]

This changes how you chase. If the enemy is retreating over open ground but will soon reach light cover, it can be better to [b]stay in place[/b] and avoid the moving accuracy penalty, doing as much damage as possible before they reach the cover. Not chasing is more time efficient and keeps your squad from overextending, for a similar amount of total damage.

This works best with rifle units, which have bigger moving accuracy penalties. Submachine gun units want to keep the enemy close for as long as possible, so chasing is still better with them.

[img alt="DPS by range of a rifle squad and an SMG squad" caption="SMGs want the target in close range as long as possible, so do chase with them."]/images/wiki/cover-micro-tips/chase-with-smgs.webp[/img]

[h2]Vehicles and cover[/h2]
Vehicles and emplacements can't get the defensive multipliers from cover. But world objects still block scatter shots, so if a ballistic shot misses its accuracy roll, cover can stop the scatter shot from landing on the vehicle.

[img alt="Sandbags blocking an anti-tank shot aimed at a vehicle" caption="Sandbags blocked a scatter shot from landing on a 4x4."]/images/wiki/cover-micro-tips/vehicle-scatter-block.webp[/img]

`.trim(),
};

export default article;
