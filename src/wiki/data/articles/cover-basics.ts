import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "cover-basics",
  category: "combat",
  group: "cover",
  title: "Cover Basics: Open Ground, Light & Heavy Cover",
  summary:
    "How cover works in COH3: the cover shield, the half of the squad rule, directional cover, and what open ground, light cover and heavy cover actually do.",
  author: "tightrope",
  authorUrl: "https://www.youtube.com/@tightropegaming",
  date: "2026-03-14",
  updated: "2026-11-25",
  tags: ["cover", "light cover", "heavy cover", "open ground", "aoe"],
  order: 1,
  series: { id: "cover", part: 1 },
  contents: `
[previewyoutube=5dIMu3ww2DA;full][/previewyoutube]

This series is a written version of tightrope's video [url=https://www.youtube.com/watch?v=5dIMu3ww2DA]How cover works in COH3 and the best counters to it[/url]. It explains the mechanics behind cover, the three cover types, which weapons perform best and worst against cover, and a set of micro tricks to use and counter it.

[note title="TL;DR"]
[list]
[*]Half or more of a squad's models must be in cover for the shield to show, but only the models actually in cover are protected.[/*]
[*]Against explosives like grenades and artillery, cover only works if it is between the unit and the [b]explosion[/b]. Since patch 2.5.0, direct-fire guns check the shooter instead.[/*]
[*]Light cover makes infantry harder to hit and resist suppression, but does nothing against AoE.[/*]
[*]Heavy cover adds a 50% damage reduction on top.[/*]
[*]Against AoE weapons, spread out in the open is often better than clumped in cover.[/*]
[/list]
[/note]

[h2]How a unit gets cover[/h2]
Infantry can be positioned in cover to get defensive bonuses. This includes squads and the models that crew team weapons. A unit in cover has a shield on its decorator: a [b]yellow shield[/b] means light cover, a [b]green shield[/b] means heavy cover.

Garrison cover, which units get from being inside a building or a constructed defence like a bunker or fighting pit, behaves differently and has [url=/wiki/combat/garrison-cover]its own article[/url].

[img alt="A machine gun team in a crater with the light cover tooltip" caption="Hovering the mouse over a crater shows the light cover positions it offers."]/images/wiki/cover-basics/light-cover-tooltip.webp[/img]

[h2]The half of the squad rule[/h2]
Moving a squad into a crater and stopping when only one model is inside shows no shield. Once a second model enters, the shield appears. You need [b]half or more of the models[/b] of a squad in cover for the shield to appear.

The shield does [b]not[/b] mean every model is protected. Models outside the cover are not protected, and if the enemy attacks from their side they will likely be shot first and die quickly.

[img alt="A squad half inside a crater" caption="The shield appears once half the squad is in cover, the models outside it are still unprotected."]/images/wiki/cover-basics/half-squad-rule.webp[/img]

Some objects are too small to protect a whole squad, especially for high model count units. Pay attention to the number of green or yellow dots that appear when you hover the cover.

[h2]Directional cover[/h2]
Most cover is [b]directional[/b]: it has to be between your unit and the source of damage.

[img alt="Squads behind a wall with an arrow showing the direction of damage" caption="Directional cover only protects against damage coming from the other side."]/images/wiki/cover-basics/direction-of-damage.webp[/img]

Some light cover is [b]omnidirectional[/b] and protects no matter where the attack comes from, like the craters left by heavy artillery. There is no known omnidirectional heavy cover in COH3.

[h2]Explosion position, not shooter position[/h2]
If an explosive, like a grenade, is thrown over cover and explodes on your side, the cover offers no protection because it is not between the explosion and the squad.

[img alt="A soldier behind sandbags with the cover marked between him and the explosion" caption="The cover has to sit between the explosion and the model."]/images/wiki/cover-basics/cover-needed-here.webp[/img]

This is the main difference from COH2, where cover was based on the position of the unit that launched the attack, not the explosion itself.

[note title="Patch 2.5.0" color="blue"]Direct-fire projectile weapons (tank guns, autocannons, AA guns, anti-tank rifles) now use the position of the [b]firing unit[/b]: if the cover is between the target and the shooter, its damage reduction applies even when the shell explodes behind the cover. Grenades, mortars, artillery and other lobbed weapons still use the explosion position.[/note]

[img alt="COH2 tooltip comparison showing unit position versus explosion position" caption="In COH2 the attacker's position decided the cover, in COH3 it is the explosion."]/images/wiki/cover-basics/explosion-position.webp[/img]

[h2]Open ground[/h2]
Open ground is the absence of cover. All weapon types do [b]100% damage[/b] to units in the open.

The advantage of open ground is that the squad stays in its default formation with a lot of space between models. That makes AoE weapons like grenades or flamethrowers less effective: fewer models are inside the area, and those that are tend to be further from the centre. Most AoE weapons do maximum damage in the middle and taper off towards the edge.

[img alt="Gammon bomb damage by distance from centre" caption="Gammon bomb AoE: full damage near the centre, much less at the edge."]/images/wiki/cover-basics/open-ground-aoe.webp[/img]

This is why open ground is often [b]better than cover against AoE weapons[/b].

[note title="Patch 2.5.0" color="blue"]Most squad formations were tightened by 0.5 to 1 metre, and small arms now focus on the closest model in front of them. Squads in the open are a bit more vulnerable to AoE and lose models faster, so open ground is less of a safe default than before.[/note]

[h2]Light cover[/h2]
Light cover comes from vegetation, wooden objects like fences and crates, and craters, both the ones that start on the map and those made by artillery during the match.

Light cover makes infantry [b]harder to hit[/b] and [b]resistant to suppression[/b]. It offers [b]no protection against AoE weapons[/b] like flamethrowers, artillery or tank fire. Because it also makes the models group up closely, light cover is usually a liability against AoE weapons.

[h2]Heavy cover[/h2]
Heavy cover comes from rocks and rubble, concrete or stone walls, vehicles and wrecks, and player built defences like sandbags and tank traps.

Heavy cover gives the same harder to hit bonus as light cover, a higher suppression resistance, and a [b]50% damage reduction[/b].

Since patch 2.5.0 cover is also harder to destroy: heavy cover objects have 35 armour (up from 25) and standardised health, light cover has a minimum of 200 health, most light vehicles only have light crush, and flattened building ruins more consistently give heavy cover.

[img alt="Light cover and heavy cover tooltips side by side" caption="Heavy cover adds the damage reduction and more suppression resistance."]/images/wiki/cover-basics/light-vs-heavy-tooltip.webp[/img]

The exact numbers for every weapon type are in the next part: [url=/wiki/combat/cover-vs-weapon-types]Cover vs weapon types[/url].
`.trim(),
};

export default article;
