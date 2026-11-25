import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "suppression-and-cover",
  category: "combat",
  group: "cover",
  title: "Suppression and Cover",
  summary:
    "How light, heavy and garrison cover reduce incoming suppression and speed up recovery, and how to use a nearby building to shake off suppression.",
  author: "tightrope",
  authorUrl: "https://www.youtube.com/@tightropegaming",
  date: "2026-03-14",
  updated: "2026-11-25",
  tags: ["cover", "suppression", "machine guns", "garrison", "micro"],
  order: 3,
  series: { id: "cover", part: 3 },
  contents: `
Most suppression comes from small arms fire, so cover has a big effect on how quickly a squad gets suppressed and pinned.

[h2]Suppression multipliers[/h2]
[table]
[tr][th][/th][th]Light cover[/th][th]Heavy cover[/th][th]Garrison[/th][/tr]
[tr][td]Incoming suppression[/td][td]0.5[/td][td]0.1[/td][td]0 (immune)[/td][/tr]
[tr][td]Recovery rate[/td][td]2.5x[/td][td]5x[/td][td]500x[/td][/tr]
[/table]

Light cover halves the suppression a unit receives and heavy cover reduces it by 90%. These reductions apply to [b]every weapon type that deals suppression[/b], including the few autocannons that have it. Since patch 2.5.0, direct-fire projectile weapons also have their suppression reduced by cover whenever the cover is between the target and the firing unit.

[h2]Direction and the half of the squad rule[/h2]
Like damage and accuracy, the cover must be [b]between the squad and the source of suppression[/b].

[img alt="A machine gun firing at one protected and one unprotected squad" caption="Only the squad with cover between it and the machine gun is protected."]/images/wiki/suppression-and-cover/protected-unprotected.webp[/img]

Unlike damage, only [b]half or more[/b] of the models need to be in cover, and the [b]whole squad[/b] gets the suppression resistance.

[img alt="A squad half in a crater under machine gun fire" caption="With half the squad in cover, the whole squad gets the suppression bonus."]/images/wiki/suppression-and-cover/whole-squad-bonus.webp[/img]

This is the other major difference from COH2, where a single model out of cover let the whole squad get suppressed easily.

[h2]Recovery rate[/h2]
All infantry have a suppression recovery rate of [b]0.008[/b]. It is multiplied by 2.5 in light cover and by 5 in heavy cover.

[img alt="Suppression recovery rate demonstration" caption="The default recovery rate is 0.008, light cover multiplies it by 2.5."]/images/wiki/suppression-and-cover/recovery-rate.webp[/img]

The reduced incoming suppression together with the faster recovery is what lets a unit in heavy cover avoid getting suppressed by a single machine gun, or slows down the step from suppressed to pinned in light cover.

[img alt="A squad behind heavy cover under machine gun fire" caption="Heavy cover: 90% less suppression and 5x the recovery."]/images/wiki/suppression-and-cover/heavy-cover-suppression.webp[/img]

[h3]The biggest recovery bonuses[/h3]
The cover multipliers are small next to two other bonuses. These are the cases where units become unsuppressed almost immediately:
[list]
[*][b]Not being shot at[/b] for 10 seconds: a 50x recovery bonus.[/*]
[*][b]Being inside a garrison[/b]: a 500x recovery multiplier, and garrisoned units are immune to suppression.[/*]
[/list]

[img alt="Timer showing recovery after the machine gun stops firing" caption="Not being shot at for 10 seconds gives a 50x recovery bonus."]/images/wiki/suppression-and-cover/no-suppression-10-seconds.webp[/img]

[note title="Patch 2.5.0" color="blue"]Before 2.5.0, the 10 second timer only reset when the squad was hit by a weapon that deals suppression. Now [b]any[/b] incoming fire stops the out of combat bonus, so riflemen next to your HMG keep a suppressed squad suppressed. The squad still gets the bonus if it is firing but not being fired at.[/note]

[h2]Micro trick: jump into a garrison[/h2]
If a squad is suppressed and close to an empty building, right click it to go inside. The squad gets a speed bonus and crawls quickly to the door. Once inside, it recovers from suppression almost immediately thanks to the 500x multiplier.

[img alt="A suppressed squad entering a building" caption="Inside a garrison the recovery multiplier is 500x."]/images/wiki/suppression-and-cover/garrison-recovery.webp[/img]

[h2]Point-blank range[/h2]
Small arms, infantry LMGs and scoped rifles ignore the defensive bonuses of cover when the target is [b]10 range or closer[/b]. This is the point-blank mechanic, tightrope covers it in a separate video.
`.trim(),
};

export default article;
