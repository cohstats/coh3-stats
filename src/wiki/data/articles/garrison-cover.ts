import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "garrison-cover",
  category: "combat",
  group: "cover",
  title: "Garrison Cover & Damage All In Hold",
  summary:
    "How garrison cover differs from light and heavy cover, where to aim at a building, the damage all in hold mechanic and the fortified position bonus.",
  author: "tightrope",
  date: "2026-03-14",
  updated: "2026-11-25",
  tags: ["cover", "garrison", "buildings", "bunkers", "damage all in hold", "flamethrowers"],
  order: 4,
  series: { id: "cover", part: 4 },
  contents: `
Units get garrison cover inside buildings and constructed defences like bunkers or fighting pits. It has its own multipliers and some mechanics that light and heavy cover don't have.

[h2]Garrison multipliers[/h2]
The full table for every weapon type is in [url=/wiki/combat/cover-vs-weapon-types]Cover vs weapon types[/url]. Where garrison cover differs from light and heavy cover:

[list]
[*][b]Small arms and LMGs:[/b] a slightly worse accuracy modifier (0.55) than light and heavy cover (0.5).[/*]
[*][b]Ballistics:[/b] very strong, damage is reduced by 75%. For conventional medium tanks the machine guns often do more damage to the units inside than the main gun.[/*]
[*][b]Autocannons:[/b] get full accuracy against garrisons, but garrisons still protect far better than heavy cover. Probably because garrison cover reduces the damage of accuracy hits, and the models are spread out more.[/*]
[*][b]Artillery:[/b] damage is only reduced by 25%.[/*]
[*][b]Grenades:[/b] no damage reduction at all.[/*]
[*][b]Grenade launchers and flamethrowers:[/b] a 50% damage bonus.[/*]
[*][b]Mines:[/b] damage is reduced by 50%.[/*]
[/list]

Units inside garrisons are also [b]immune to suppression[/b] and recover from it 500 times faster, see [url=/wiki/combat/suppression-and-cover]Suppression and cover[/url].

[h2]Where the models are matters[/h2]
Inside a garrison every soldier tries to take a firing position, like a window or a rooftop. Where those models are decides whether they take damage and how much.

If every model is on one side of the building and you hit the [b]far side[/b] with an AoE weapon, the explosion happens on that side and the AoE may not reach the squad at all. Hitting the side with the occupied windows damages the soldier closest to the explosion and the ones above him.

[img alt="A tank shelling the empty side of a building" caption="Shelling the far side of the building: the squad inside took 0 damage."]/images/wiki/garrison-cover/garrison-far-side.webp[/img]

Watch where the enemy soldiers are inside the building and target that area.

[note title="Tip"]Unit occlusion in garrisons can be unreliable. Toggling the occlusion setting off and on once in the game settings can make it work correctly.[/note]

[h2]Damage all in hold[/h2]
Some weapons have a special anti-garrison mechanic called [b]damage all in hold[/b]. The weapon does its [b]far AoE damage[/b] to every unit inside the garrison that was not in the attack's AoE.

[img alt="Weapon data with the far AoE damage value highlighted" caption="Damage all in hold uses the far AoE value, 0.2 x damage in this case."]/images/wiki/garrison-cover/damage-all-in-hold.webp[/img]

Grenades are a good example. The grenade's AoE circle doesn't touch a single model inside the building, but every model takes 56 damage, the same as a unit at the outer edge of the same explosion in the open.

[img alt="A grenade exploding next to a building with every model taking damage" caption="The AoE misses every model, but each takes 56 damage."]/images/wiki/garrison-cover/grenade-56-damage.webp[/img]

Damage all in hold is still capped by the weapon's [b]max members damaged per squad[/b] limit, so some grenades only hit four models.

[h3]Which weapons have it[/h3]
Damage all in hold is enabled on:
[list]
[*]Flamethrowers[/*]
[*]Grenades and grenade launchers[/*]
[*]Mortars and light artillery[/*]
[*]Barrage abilities on some units[/*]
[*]A handful of other, more anti-infantry focused weapons[/*]
[/list]

Most of these have far AoE multipliers around [b]0.2[/b]. Flamethrowers are unusual: they do 100% damage everywhere in their AoE. That is why every model in a building dies at the same rate under a flamethrower, and why flamethrowers are so strong against garrisons. They also have no model cap and better far AoE values than grenade launchers, which is fair, since you have to get closer to use them.

[h3]Hidden models[/h3]
If the building doesn't have enough firing positions for every soldier, the hidden models also take the damage all in hold amount.

Weapons without damage all in hold can still damage hidden models. tightrope speculates they take the damage dealt at the [b]centre of the building[/b]. When in doubt, especially with heavy artillery and off-maps that mostly don't have damage all in hold, target the middle of the building.

[h3]Damage over time[/h3]
Molotovs and phosphorus have damage all in hold on their initial explosion, but not on the damage over time, despite the animations. Models must be inside the burning area to take it. This can make them weak against large buildings, especially phosphorus, whose vision blocking makes it harder to see where the units are.

[img alt="A molotov burning one side of a building" caption="Only the models on the burning side take the damage over time."]/images/wiki/garrison-cover/damage-over-time.webp[/img]

[h2]Fortified position combat bonus[/h2]
In patch 2.2 Relic added a bonus for units inside [b]constructed defences[/b]: bunkers, fighting nests, fighting positions and hardpoints. You cannot get inside the British or Afrikakorps HMG nests.

A gammon bomb thrown at the edge of a bunker uses damage all in hold as expected, but the squad only takes 28 damage instead of 56. That is garrison cover with an extra 50% damage reduction.

[img alt="28 damage in a fortified position next to 56 damage in a normal garrison" caption="The same grenade does 28 damage in a fortified position and 56 in a normal building."]/images/wiki/garrison-cover/fortified-position.webp[/img]
`.trim(),
};

export default article;
