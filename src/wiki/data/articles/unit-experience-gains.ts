import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "unit-experience-gains",
  category: "veterancy",
  title: "How Units Gain Experience",
  summary:
    "Quick maths on veterancy: unit value, experience from damage, kills and squad wipes, the veterancy and catch up bonuses, and experience from taking damage.",
  authors: [{ name: "Tsuyara" }],
  date: "2026-11-11",
  tags: ["veterancy", "experience", "xp", "unit value"],
  order: 1,
  contents: `
Experience is fairly straightforward, but since Relic made some changes in 3.0, here it is written down for posterity.

[img alt="Summary of experience gains for the attacker and the defender" caption="Everything on one card: the attacker gets 1.5x the value for damage, kills and squad wipes, the defender 0.5x for damage taken."]/images/wiki/unit-experience-gains/experience-summary.webp[/img]

[h2]Unit value[/h2]
A unit's value is made of its manpower and fuel cost:
[code]value = manpower + (fuel × 5)[/code]
For example, a Crusader: 300 MP + 70 fuel × 5 = [b]650 value[/b].

[note title="Internal cost"]This is the internal cost of the unit's entity. Call-ins may cost something different from the actual unit. For vehicles, the unit pages on [url=/explorer]COH3 Stats[/url] show the right values.[/note]

[h2]Experience from damage[/h2]
Doing damage gives 1.5x the value of the damage you did:
[code]experience = (damage / max HP) × value × 1.5[/code]
Shooting the Crusader with an AT gun gives:
[code](160 / 600) × 650 × 1.5 = 260 experience[/code]
It is the total experience payout multiplied by the % of damage you did.

[h2]Experience from kills[/h2]
A kill grants [b]another full 1.5x[/b] the killed unit's value, on top of what you got for the damage:
[code]damage experience = 650 × 1.5 = 975
kill experience   = 650 × 1.5 = 975
total             = 975 + 975 = 1950[/code]
So up to [b]3x a unit's value[/b] for killing it from full health.

[h2]The last model bonus[/h2]
Killing the [b]last model of an infantry squad[/b] grants another 1.5x of its value, for up to [b]4.5x[/b] in total.

This is a little inconsistent when you kill the whole squad in one strike, like with a grenade, which can grant the last model bonus for [b]all[/b] the squad members killed.

Team weapons can technically give it too, but the team weapon itself counts as a model, so you only get it from killing the fleeing crew of AT guns, mortars and similar. Worth chasing those down.

[h2]Veterancy[/h2]
Each veterancy level adds an additive +20% to the value:
[table]
[tr][th]Veterancy[/th][th]Value multiplier[/th][/tr]
[tr][td]Vet 0[/td][td]1.0x[/td][/tr]
[tr][td]Vet 1[/td][td]1.2x[/td][/tr]
[tr][td]Vet 2[/td][td]1.4x[/td][/tr]
[tr][td]Vet 3[/td][td]1.6x[/td][/tr]
[/table]
So veteran units give a lot more experience to anyone damaging them.

[h3]Catch up bonus (3.0)[/h3]
Patch 3.0 added another bonus: an extra multiplicative [b]1.1x[/b] if you are 2 veterancy levels behind the target and [b]1.2x[/b] if you are 3 levels behind. It multiplies with everything else.

[h2]Infantry and team weapons[/h2]
For infantry, the [b]individual model cost[/b] is what matters, not the cost of the whole squad. For most built infantry this is the total cost divided by the number of models. As with vehicles, the call-in cost does not matter, the internal cost does.

Team weapons are a hot mess, but generally use [b]50 MP per crew member[/b]. So a sniper killing a crew member from full health gains 150 experience (50 × 1.5 for the damage + 50 × 1.5 for the kill).

[h2]Experience from taking damage[/h2]
Taking damage gives a third of what the attacker gets for doing the damage, [b]without[/b] the kill bonus. It uses the defender's value:
[code]experience = (damage / max HP) × value × 0.5[/code]
A sniper killing an AT gun crew member gets its 150 experience, while the team weapon receives 25. Not a lot, really.

Relic supposedly changed the received damage modifier from 0.75 to 0.9. That did nothing, the modifier seems to be entirely unused.

And that's basically how veterancy works. Glorp.
`.trim(),
};

export default article;
