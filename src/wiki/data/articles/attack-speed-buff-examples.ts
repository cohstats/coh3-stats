import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "attack-speed-buff-examples",
  category: "combat",
  group: "firing",
  title: "Attack Speed in Practice: Buffs That Changed",
  summary:
    "War Cry, Infantry Section and Bersaglieri veterancy and the Semovente were moved from rate of fire to attack speed. DPS charts of what that actually did, and why it matters.",
  author: "Tsuyara",
  date: "2026-11-23",
  tags: ["attack speed", "rate of fire", "veterancy", "balance"],
  order: 3,
  series: { id: "firing-cycles", part: 3 },
  contents: `
Several abilities and veterancy levels were changed from old style rate of fire to [url=/wiki/combat/rate-of-fire-vs-attack-speed]overall attack speed[/url]. The charts below leave out accuracy and other bonuses to keep them clean, feel free to play around with those in the [url=/explorer/dps]COH3 Stats DPS calculator[/url].

[h2]War Cry[/h2]
War Cry was changed from +50% rate of fire to +50% attack speed. This is what that actually means:

[img alt="Gurkha DPS with the old and the new War Cry" caption="Gurkha Rifles DPS without War Cry, with the pre 2.3 War Cry and with War Cry now."]/images/wiki/attack-speed-buff-examples/war-cry.webp[/img]

[h2]Infantry Section veterancy[/h2]
The old rate of fire veterancy (+15%, +15%) vs the new one (+10%, +15%, but it is attack speed):

[img alt="Infantry Section DPS with the old and the current veterancy" caption="Infantry Section DPS at baseline, with the old veterancy and the current veterancy."]/images/wiki/attack-speed-buff-examples/infantry-section-veterancy.webp[/img]

[h2]Bersaglieri veterancy[/h2]
The new +15% attack speed vs the old +20% rate of fire:

[img alt="Bersaglieri DPS with +20% rate of fire and +15% attack speed" caption="Bersaglieri Squad DPS: baseline, +20% rate of fire and +15% attack speed."]/images/wiki/attack-speed-buff-examples/bersaglieri-veterancy.webp[/img]

[h2]Semovente[/h2]
There are also weapons where the difference doesn't matter much, because both modifiers scale well. In 2.4 the Semovente was moved from rate of fire to attack speed without even reducing the number. The difference is modest, but still there.

[img alt="Semovente DPS with +28% rate of fire and +28% attack speed" caption="Semovente da 75/18 DPS: baseline, +28% rate of fire and +28% attack speed."]/images/wiki/attack-speed-buff-examples/semovente-attack-speed.webp[/img]

[h2]Does this matter?[/h2]
In a way, no. Most players don't care how much a buff does, only that the unit gets stronger. Still, it affects how players see the game and the decisions they make. Putting a juicy Vengeance on a Vickers to wreck a push, only for it to change so little, is disappointing and unintuitive. It also makes the maths super messy.

Whether it is picking which buff to put on a unit, judging whether an upgrade or ability is worth it, or just not being able to tell how strong a buff is before using it, it does matter in some ways.

[h2]A small plea to Relic[/h2]
[list=1]
[*][b]Different names for different modifiers.[/b] Two very different modifiers with the same name is very confusing. Until everything can (hopefully) move to attack speed, +rate of fire could be renamed to "cooldown/reload reduction", which makes it very clear what it does.[/*]
[*][b]Let attack speed shorten the burst.[/b] Burst weapons not benefiting from "rate of fire" is unintuitive and makes them scale poorly in an odd, uncontrolled way. Attack speed could reduce the burst time (keeping the same shots), so burst weapons scale as well as single shot ones: 20% attack speed makes everything take 20% less time, and every squad with +20% attack speed gets +25% DPS. There is already a separate burst length modifier for softer buffs.[/*]
[*][b]Fix the percentages in the text.[/b] Please don't call a 50% reduction in something +50% speed or +50% rate of fire. If you add 50% speed to a car, it doesn't take HALF as long, that is +100% speed. Either call it a 50% time reduction or +100% speed. No need to change the values, just the text.[/*]
[*][b]Let us look into state trees.[/b] COH3 Stats is trying, but it keeps running into things that happen in the black box that is state trees.[/*]
[/list]
`.trim(),
};

export default article;
