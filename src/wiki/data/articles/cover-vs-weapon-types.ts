import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "cover-vs-weapon-types",
  category: "combat",
  group: "cover",
  title: "Cover vs Weapon Types: Multipliers & Counters",
  summary:
    "The cover multipliers for every weapon type, from small arms to mines, and which weapons are the best and worst against light, heavy and garrison cover.",
  authors: [{ name: "tightrope", url: "https://www.youtube.com/@tightropegaming" }],
  date: "2026-03-14",
  updated: "2026-11-25",
  tags: [
    "cover",
    "small arms",
    "ballistics",
    "autocannon",
    "artillery",
    "grenades",
    "flamethrowers",
  ],
  order: 2,
  series: { id: "cover", part: 2 },
  contents: `
Every weapon in the game falls into one of the categories below. Each has its own accuracy and damage multipliers against light, heavy and garrison cover.

[h2]Cover multiplier table[/h2]
A value below 1 helps the unit in cover, a value above 1 helps the attacker. The values are from the video, with the infantry LMG damage updated for patch 2.5.0. The garrison column is explained in [url=/wiki/combat/garrison-cover]Garrison cover[/url].

[table]
[tr][th]Weapon type[/th][th]Light accuracy[/th][th]Light damage[/th][th]Heavy accuracy[/th][th]Heavy damage[/th][th]Garrison accuracy[/th][th]Garrison damage[/th][/tr]
[tr][td]Small arms[/td][td]0.5[/td][td]1[/td][td]0.5[/td][td]0.5[/td][td]0.55[/td][td]0.5[/td][/tr]
[tr][td]Infantry LMGs[/td][td]0.5[/td][td]1[/td][td]0.5[/td][td]0.5[/td][td]0.55[/td][td]0.5[/td][/tr]
[tr][td]Scoped rifles[/td][td]0.75[/td][td]1[/td][td]0.75[/td][td]0.5[/td][td]0.75[/td][td]0.5[/td][/tr]
[tr][td]Ballistics[/td][td]0.5[/td][td]1[/td][td]0.5[/td][td]0.5[/td][td]0.4[/td][td]0.25[/td][/tr]
[tr][td]Autocannons[/td][td]0.5[/td][td]1[/td][td]0.5[/td][td]0.5[/td][td]1[/td][td]0.5[/td][/tr]
[tr][td]Artillery[/td][td]1[/td][td]1[/td][td]1[/td][td]0.5[/td][td]1[/td][td]0.75[/td][/tr]
[tr][td]Grenades[/td][td]1[/td][td]1[/td][td]1[/td][td]0.5[/td][td]1[/td][td]1[/td][/tr]
[tr][td]Grenade launchers[/td][td]1[/td][td]1.33[/td][td]1[/td][td]1.33[/td][td]1[/td][td]1.5[/td][/tr]
[tr][td]Flamethrowers[/td][td]1[/td][td]1[/td][td]1[/td][td]1.25[/td][td]1[/td][td]1.5[/td][/tr]
[tr][td]Mines[/td][td]1[/td][td]1[/td][td]1[/td][td]1[/td][td]1[/td][td]0.5[/td][/tr]
[/table]

Suppression has its own multipliers, see [url=/wiki/combat/suppression-and-cover]Suppression and cover[/url].

[h2]Small arms, LMGs and scoped rifles[/h2]
[b]Small arms[/b] covers everything from a pistol up to the .50 cal, with two exceptions that have their own values: squad carried [b]light machine guns[/b] (BAR, Bren, Breda, M1919 and so on) and [b]scoped rifles[/b], like the ones Tommies get from the sniper rifle upgrade.

[list]
[*]Small arms and infantry LMGs have their accuracy [b]halved[/b] against units in either type of cover.[/*]
[*]Scoped rifles only get a [b]25% accuracy penalty[/b], which makes them a decent cover counter.[/*]
[*]Heavy and garrison cover reduce small arms, infantry LMG and scoped rifle damage by 50%.[/*]
[/list]

[img alt="Cover multipliers for small arms, infantry LMGs and scoped rifles" caption="Before patch 2.5.0 infantry LMGs only lost 40% damage against heavy cover."]/images/wiki/cover-vs-weapon-types/small-arms-multipliers.webp[/img]

[note title="Patch 2.5.0" color="blue"]Automatic rifles and LMGs had their damage penalty against heavy and garrison cover increased from 40% to 50%, the same as other small arms, so they no longer have an edge against heavy cover. HMGs also got a bigger accuracy penalty against units in cover.[/note]

Small arms, LMGs and scoped rifles also lose all cover bonuses at 10 range or closer. This is the [b]point-blank mechanic[/b], tightrope covers it in a separate video.

[h2]Ballistics[/h2]
Ballistics covers basically every vehicle mounted gun that is not small arms or artillery, from medium tanks that shoot in a straight line, like the Sherman or Panzer IV, to vehicles with a more parabolic flight path, like the StuG D and Brummbär.

The accuracy penalty from cover barely matters for ballistics. Their accuracy is tuned to shoot at vehicles, which are about 20 times larger than infantry, so most hits on infantry come through the [url=/wiki/combat/scatter]scatter system[/url], which ignores the accuracy multipliers of cover.

[img alt="Panzer IV accuracy against infantry and a tank" caption="0.0475 accuracy is a 4.75% chance against target size 1, but 95% against target size 20."]/images/wiki/cover-vs-weapon-types/ballistic-target-size.webp[/img]

Scatter shots collide with obstacles and vehicles in their path, but not with the ground or with infantry. Against infantry the shell lands at its end point and only its AoE does damage. A world object like sandbags can stop the shot before that point. The shell explodes on the object, and if the object is thin or the AoE large, the explosion can still damage the units behind. See [url=/wiki/combat/terrain-and-projectile-flight]Terrain & projectile flight[/url] for more on shot blockers.

[note title="Patch 2.5.0" color="blue"]Before 2.5.0, cover gave no damage reduction against direct-fire projectiles (tank guns, autocannons, AA guns, anti-tank rifles) if the shell landed behind the cover or rolled a hit. Now, if the target has directional or area cover against the [b]firing unit[/b], the cover damage reduction applies to direct hits and splash damage. Suppression is reduced as well, see [url=/wiki/combat/suppression-and-cover]Suppression and cover[/url] for the multiplier. This makes heavy cover much better against tanks and autocannons. Lobbed weapons like mortars, artillery, the Stummel, StuG D and Brummbär are not affected.[/note]

[h3]Sandbags or tank traps[/h3]
Against direct-fire guns, both now give the 50% damage reduction as long as they are between your squad and the tank, even when a shell explodes on them or behind them. What still differs is how long they last and how many models they protect. Tank traps have more health and armour, and because they are thicker, less AoE reaches the units behind. But they offer fewer cover positions with erratic spacing, which is hard to use with high model count squads. Sandbags give a clean line of positions for the whole squad, which usually makes them the more reliable option.

[h3]The wrong side of cover[/h3]
Being on the wrong side of cover, where it is not between your squad and the tank, is the worst of both worlds. The squad gets no damage reduction, because the cover isn't between it and the shooter. And the object stops scatter shots from overshooting, so more shells land on the infantry, right next to the centre of the explosions. Move the squad to the other side, or into the open.

[img alt="Tank shells overshooting infantry in the open" caption="In the open many scatter shots overshoot. Against a blocker they land on the infantry instead."]/images/wiki/cover-vs-weapon-types/overshoot-in-open.webp[/img]

[h3]Parabolic ballistics[/h3]
Parabolic shells often fly over sandbags instead of colliding with them and land on the other side, giving the infantry no cover bonus at all. Against these weapons it is usually better to leave heavy cover and spread out than to stay clumped up hoping the shots don't go over.

[img alt="A StuG shell landing behind sandbags" caption="Parabolic shells can explode on the infantry's side of the cover."]/images/wiki/cover-vs-weapon-types/parabolic-over-cover.webp[/img]

[h2]Autocannons[/h2]
Autocannons are halfway between ballistics and small arms. They fly in a straight line, and when a shot fails its accuracy roll it scatters and collides with blockers. But they also have high accuracy, comparable to small arms, so they rely on [b]accuracy hits[/b] on infantry.

They have the same cover multipliers as other ballistics. Because autocannons rely on accuracy hits, the harder to hit bonus of cover matters here, unlike against tank guns.

[list]
[*][b]Heavy cover[/b] is the best answer. The accuracy is halved, and since patch 2.5.0 every hit and splash is also reduced by 50% when the cover is between the squad and the autocannon. Suppression is reduced too, see [url=/wiki/combat/suppression-and-cover]Suppression and cover[/url]. Before the patch this only worked if the shell collided with the cover.[/*]
[*][b]Light cover[/b] only halves the accuracy, it has no damage reduction. Its scatter shots still explode on the cover or behind it at full damage, so thin light cover that is destroyed quickly is often worse than the open.[/*]
[/list]

[img alt="Autocannon AoE on an engineer squad" caption="Autocannon AoE is small: a damage cap of 2 models or less and a radius of 3 or less."]/images/wiki/cover-vs-weapon-types/autocannon-aoe.webp[/img]

Because the AoE is so small, autocannons often hit only one model at a time when the squad is spread out. Craters are a liability: they halve the accuracy, but there is nothing to block the scatter shots and the models are bunched together.

[img alt="Autocannon firing at a squad in a crater" caption="Craters don't block scatter shots."]/images/wiki/cover-vs-weapon-types/craters-vs-autocannon.webp[/img]

Some autocannon vehicles also carry machine guns. In light cover, the bonus against the MG is not enough to make up for the extra autocannon damage. Heavy cover reduces the damage from both.

[h2]Artillery[/h2]
Artillery includes mortars, light artillery, rocket artillery and howitzers, plus most off-map strikes and bombing runs. All artillery has an accuracy of zero, so every hit comes through scatter and the harder to hit bonus is irrelevant. Relic also set the artillery accuracy multipliers against cover to 1.

Heavy cover reduces artillery damage by 50%, but the shells come from above and often land on the other side of the cover, like parabolic ballistics. Infantry clumped in heavy cover often take [b]more[/b] damage than they would spread out in the open.

[h2]Grenades and grenade launchers[/h2]
[b]Grenades[/b] include satchel charges, but not demolition charges. Light cover offers no protection against them and heavy cover halves the damage. That is why you should throw grenades slightly [b]behind[/b] heavy cover, to remove its defensive bonus.

[b]Grenade launchers[/b] are different. Despite having accuracy values in their stats, they can't roll accuracy hits, they rely completely on scatter. They get a [b]33% damage bonus[/b] against units in light and heavy cover, which makes them a great counter to cover.

[note title="Testing note" color="gray"]In tightrope's tests the bonus applied against crater like and funnel like cover, but never against a unit behind sandbags.[/note]

[h2]Flamethrowers and molotovs[/h2]
Flamethrowers, handheld and vehicle mounted, are the classic cover counter in every Company of Heroes. They do [b]100% damage[/b] in light cover and [b]125%[/b] in heavy cover.

[note title="Possible bug" color="orange"]A unit on the wrong side of heavy cover, in the open, took the same bonus damage as the units in cover. A ground attack in front of the cover could increase the damage further, but flame ticks sometimes miss with ground attack, so it is not worth it as a micro trick.[/note]

[h3]The flamethrower damage area[/h3]
Unlike the circular AoE of explosions, the flamethrower AoE is a rectangle. When you right click attack a model in the middle of a squad, the models in front of it take no damage, only the ones behind and to the sides. The charring on the ground is a good representation of the damage area.

A ground attack in roughly the same spot does damage on [b]both sides[/b] of the target point, roughly doubling the area.

[img alt="A flamethrower targeting the closest model at the edge of a squad" caption="The flamethrower doesn't target the middle of the squad, even when it is closest."]/images/wiki/cover-vs-weapon-types/flamethrower-targeting.webp[/img]

Practical advice that should survive future patches:
[list]
[*]With a right click attack you don't control which model is targeted. If it is a model on the edge, much of the damage area is wasted.[/*]
[*]Against a squad clumped in cover, [b]ground attack the middle of the squad[/b], perhaps slightly in front of the cover.[/*]
[*]Reposition the flamethrower so the enemy is lined up going away from you, the long AoE then reaches more models.[/*]
[/list]

[img alt="Flamethrower ground attack on a squad behind cover" caption="Ground attacking the middle: 3 bursts for 233 damage, 62% more than a normal attack."]/images/wiki/cover-vs-weapon-types/flamethrower-ground-attack.webp[/img]

[b]Molotovs[/b] behave more like grenades. The initial 10 damage when they land is halved by heavy cover if they land on the far side, and the 10 damage per second burn gets no bonus against cover, unlike flamethrowers.

[h2]Mines and snipers[/h2]
Mines do 100% damage to units in light and heavy cover. A common trick is to plant a mine on cover the enemy has built. Squads group up when they approach cover, so the mine is more likely to kill more than one model, and it might destroy the cover too.

Snipers are another classic cover counter. They kill a model with each hit no matter the cover type.

[h2]Unique abilities[/h2]
Some abilities, like canister shot on the Greyhound or fragmentation rounds, have their own cover multipliers. They usually say so in the ability description.

[img alt="Greyhound canister shot ability tooltip" caption="Canister shot: damage reduced by 50% against light cover and 75% against heavy cover."]/images/wiki/cover-vs-weapon-types/canister-shot.webp[/img]
`.trim(),
};

export default article;
