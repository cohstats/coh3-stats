import { WikiArticle } from "../../wiki-types";

const article: WikiArticle = {
  slug: "territory-capture-rates",
  category: "economy",
  group: "territory",
  title: "Capture Times & Capture Rates by Faction",
  summary:
    "How long every territory point takes to capture and revert, how unit capture rates shorten that time, and the capture and revert rates of every unit, upgrade and ability for all four factions.",
  authors: [
    { name: "tightrope", url: "https://www.youtube.com/@tightropegaming" },
    { name: "Tsuyara" },
  ],
  date: "2025-08-03",
  updated: "2026-11-26",
  tags: ["territory", "capture", "revert", "capture rate", "resources", "battlegroups"],
  order: 1,
  series: { id: "territory-capture", part: 1 },
  contents: `
[previewyoutube=Mb_8pKNOqL0;full][/previewyoutube]

This series is a written version of tightrope's video [url=https://www.youtube.com/watch?v=Mb_8pKNOqL0]Learn how to capture territory like a pro in COH3[/url] from August 2025, edited and updated by Tsuyara. This part covers how long points take to capture, what a capture rate is, and the capture and revert rates of every unit and ability. The next parts cover [url=/wiki/economy/territory-capture-tactics]principles and tactics[/url] and [url=/wiki/economy/territory-capture-micro-tips]micro tips[/url].

[note title="TL;DR"]
[list]
[*]Fuel points take 20, 30 or 40 seconds to capture and 5 seconds less to revert. Munitions points are faster to capture: 12.5, 30 and 30 seconds. Victory points take 25 seconds to capture but only 10 to revert.[/*]
[*]The map explorer shows the capture time, revert time and income of every point on a map.[/*]
[*]Those times are for a capture rate of 1. The time is divided by the unit's capture rate.[/*]
[*]All crewed team weapons capture at a rate of 1.[/*]
[*]Capture rate bonuses from veterancy, upgrades and abilities are usually multipliers.[/*]
[*]The fastest capturer in the tables is the Wehrmacht Kettenkrad with Communication Cables at vet 3, with a capture rate of 3.[/*]
[/list]
[/note]

[h2]Capturing and reverting[/h2]
[b]Capturing[/b] territory makes a point go from neutral to under your control. [b]Reverting[/b], often called de-capturing, makes a point go from enemy control back to neutral.

[img alt="An engineer squad capturing a medium fuel point" caption="Capturing turns a neutral point to your side, reverting turns an enemy point back to neutral."]/images/wiki/territory-capture-rates/capturing.webp[/img]

[h2]Capture and revert times[/h2]
These are the times for a unit with a capture rate of 1 in patch 3.0.3:

[table]
[tr][th]Point[/th][th]Income per minute[/th][th]Capture[/th][th]Revert[/th][/tr]
[tr][td]Low fuel[/td][td]+4[/td][td]20 s[/td][td]15 s[/td][/tr]
[tr][td]Extra low fuel[/td][td]+6[/td][td]30 s[/td][td]25 s[/td][/tr]
[tr][td]Medium fuel[/td][td]+8[/td][td]30 s[/td][td]25 s[/td][/tr]
[tr][td]Extra medium fuel[/td][td]+10[/td][td]40 s[/td][td]35 s[/td][/tr]
[tr][td]High fuel[/td][td]+16[/td][td]40 s[/td][td]35 s[/td][/tr]
[tr][td]Low munitions[/td][td]+5[/td][td]12.5 s[/td][td]15 s[/td][/tr]
[tr][td]Medium munitions[/td][td]+10[/td][td]30 s[/td][td]25 s[/td][/tr]
[tr][td]High munitions[/td][td]+16[/td][td]30 s[/td][td]35 s[/td][/tr]
[tr][td]Strategic point[/td][td]+8 manpower[/td][td]20 s[/td][td]15 s[/td][/tr]
[tr][td]Victory point[/td][td]-[/td][td]25 s[/td][td]10 s[/td][/tr]
[/table]

A few maps also have extra low fuel points (+6, 30 s capture, 25 s revert) and extra medium fuel points (+10, 40 s capture, 35 s revert).

Fuel, medium munitions and strategic points take [b]5 seconds less to revert than to capture[/b]. Low and high munitions points are the other way round: they are quicker to capture than to revert. Victory points take 25 seconds to capture but only [b]10 seconds[/b] to revert.

[note title="Patch 2.5 and 3.0" color="orange"]2.5 reduced the time to capture low munitions from 20* to 12.5 and high munitions from 40* to 30. Decapture is unaffected. 3.0 reduced fuel income by 1 for low, and 2 for extra low, medium and extra medium.
[br][br][i]*Relic’s patch notes incorrectly listed the previous capture times as 15s and 45s, respectively.[/i][/note]

You can check the capture time, revert time and income of every point on a map in the [url=/explorer/maps]map explorer[/url]. Open a map, for example [url=/explorer/maps/ancona_railyard_2p]Ancona Railyard[/url], and hover over a point to see its details.

[h2]Capture rate[/h2]
Many units have a capture or revert rate above 1, which shortens these times. The time taken is the base time divided by the rate. The US Forces Scout squad has a capture rate of 1.5, so a low fuel point takes it 20 / 1.5 = [b]13.33 seconds[/b] instead of 20.

[img alt="A scout squad capturing a low point with a timer" caption="A capture rate of 1.5 cuts the 20 second capture to 13.33 seconds."]/images/wiki/territory-capture-rates/scout-capture-time.webp[/img]

[b]All crewed team weapons[/b], meaning heavy machine guns, anti-tank guns and mortars for every faction, have a capture rate of 1. They are left out of the tables below. Static team weapons ignore the capture command.

[h3]Bonuses are multipliers[/h3]
Capture rate bonuses usually multiply the unit's own rate, they are not added to it. The Scout gets +50% capture rate at vet 2, so its 1.5 capture rate is multiplied by 1.5 for a final rate of [b]2.25[/b]. The same applies to the vet and upgrade rows in all the tables below.

[h2]US Forces[/h2]
Infantry, in alphabetical order. Rows with "vet" include the veterancy bonus.

[table]
[tr][th]Unit[/th][th]Capture[/th][th]Revert[/th][/tr]
[tr][td][url=/explorer/races/american/units/bazooka_team_us]Bazooka Team[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/captain_us]Captain[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/engineer_us]Engineers[/url] / [url=/explorer/races/american/units/assault_engineer_us]Assault Engineers[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/paratrooper_us]Paratroopers[/url][/td][td]1.33[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/american/units/paratrooper_us]Paratroopers[/url] vet 1[/td][td]1.77[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/american/units/ranger_us]Rangers[/url][/td][td]1.5[/td][td]1.33[/td][/tr]
[tr][td][url=/explorer/races/american/units/riflemen_us]Riflemen[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/scout_us]Scouts[/url] / [url=/explorer/races/american/units/pathfinder_us]Pathfinders[/url] / [url=/explorer/races/american/units/artillery_observers_us]Artillery Observers[/url][/td][td]1.5[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/scout_us]Scouts[/url] / [url=/explorer/races/american/units/pathfinder_us]Pathfinders[/url] / [url=/explorer/races/american/units/artillery_observers_us]Artillery Observers[/url] vet 2[/td][td]2.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/sniper_us]Sniper[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/ssb_sniper_africa_us]SSB Sniper[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/ssf_commandos_us]SSF Commandos[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/french_infantry_us]French Rifle Section[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/american/units/resistance_fighters_battlegroup_partisans]Resistance Fighters[/url][/td][td]1[/td][td]1.25[/td][/tr]
[/table]

Saboteurs can't capture at all.
[note title="Patch 2.4" color="blue"]Changed sniper capture rate from 1 to 1.33[/note]

The vehicles that can capture:

[table]
[tr][th]Vehicle[/th][th]Capture[/th][th]Revert[/th][/tr]
[tr][td][url=/explorer/races/american/units/truck_4x4_us]4x4[/url] (vet 1 choice)[/td][td]1.25[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/american/units/greyhound_us]Greyhound[/url] (vet 1 choice)[/td][td]0[/td][td]2[/td][/tr]
[tr][td][url=/explorer/races/american/units/m29_weasal_us]Weasel[/url][/td][td]1.25[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/american/units/m29_weasal_us]Weasel[/url] vet 2[/td][td]1.875[/td][td]1.25[/td][/tr]
[/table]

The 4x4 unlocks capture and decapture with its veterancy. Greyhound unlocks decapture only.

[h3]US Forces territory abilities[/h3]
[b]Signal Layer[/b]: a vet 1 choice for the M29 Weasel. Resource points captured by the Weasel generate more fuel or munitions. In tightrope's demo, a low point captured by the Weasel gave +8 instead of +5.

[img alt="A Weasel capturing a point with the Signal Layer tooltip" caption="Signal Layer: the low point captured by the Weasel gives +8 instead of +5."]/images/wiki/territory-capture-rates/signal-layer.webp[/img]

[b]Assault Operation[/b] (Special Operations battlegroup): +200% capture and de-capture rate for infantry, which is a 3 times multiplier. A Scout squad then captures at 1.5 x 3 = 4.5, and takes 20 / 4.5 = [b]about 4.4 seconds[/b] for a low fuel point.

[img alt="A scout squad capturing with Assault Operation active" caption="With Assault Operation a Scout squad captures a low point in about 4.4 seconds."]/images/wiki/territory-capture-rates/assault-operation.webp[/img]

[b]Zone Rouge[/b] (Free French battlegroup): Deploys 5 mines around the territory point.

[b]Boundary Lockdown[/b] (Free French battlegroup): Increases construction speed around the territory point by 67% and prevents decapture while infantry or structures are within range.

[h2]Wehrmacht[/h2]
[table]
[tr][th]Unit[/th][th]Capture[/th][th]Revert[/th][/tr]
[tr][td][url=/explorer/races/german/units/coastal_officer_ger]Artillery Officer[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/coastal_reserves_ger]Coastal Reserves[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/fallschirmjagers_ger]Fallschirmjäger[/url][/td][td]1.25[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/german/units/fallschirmjagers_ger]Fallschirmjäger[/url] vet 1[/td][td]1.56[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/german/units/fallschirmpioneers_ger]Fallschirmpioneers[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/fallschirmpioneers_ger]Fallschirmpioneers[/url] vet 1[/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/grenadier_ger]Grenadiers[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/jaeger_ger]Jäger[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/jaeger_ger]Jäger[/url] with Recon Package[/td][td]1.6[/td][td]1.2[/td][/tr]
[tr][td][url=/explorer/races/german/units/panzergrenadier_ger]Panzergrenadiers[/url][/td][td]1.5[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/pioneer_ger]Pioneers[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/pioneer_ger]Pioneers[/url] vet 1[/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/sniper_ger]Sniper[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/stormtrooper_ger]Stoßtruppen[/url][/td][td]1.25[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/german/units/sturmpioneer_ger]Sturmpioneers[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/sturmpioneer_ger]Sturmpioneers[/url] vet 1[/td][td]1.5[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/guastatori_ger]Guastatori[/url][/td][td]1[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/german/units/kettenkrad_ger]Kettenkrad[/url][/td][td]1.5[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/german/units/kettenkrad_ger]Kettenkrad[/url] vet 3[/td][td]2.25[/td][td]1.875[/td][/tr]
[tr][td][url=/explorer/races/german/units/kettenkrad_ger]Kettenkrad[/url] with Communication Cables[/td][td]2[/td][td]1.5[/td][/tr]
[tr][td][url=/explorer/races/german/units/kettenkrad_ger]Kettenkrad[/url] with Communication Cables, vet 3[/td][td][b]3[/b][/td][td]2.25[/td][/tr]
[/table]

The Kettenkrad with Communication Cables at vet 3 has the highest capture rate of any unit in these tables.

[h3]Wehrmacht territory abilities[/h3]
Territory points don't give vision around their flag. [b]Communication Cables[/b] on the Kettenkrad brings some of that back: points it captures get a circle of vision around the flag, which helps a lot with map awareness. Your opponent can see it though, an eye icon shows on the point.

[img alt="The enemy view of a point captured by a Kettenkrad with Communication Cables" caption="The enemy's view: the eye icon shows that the point gives vision."]/images/wiki/territory-capture-rates/communication-cables-vision.webp[/img]

[b]Raid Package[/b] (Mechanized battlegroup): light vehicles can capture points. In the video they capture and revert at a rate of 1.

[img alt="A 221 Scout Car capturing a point with the Raid Package tooltip" caption="Raid Package lets light vehicles capture at a rate of 1."]/images/wiki/territory-capture-rates/raid-package.webp[/img]

[b]Breakthrough[/b] (Breakthrough battlegroup): +100% infantry capture and revert rate for 45 seconds.

[b]Contempt for the Weak[/b] (Terror battlegroup): +33% infantry capture and revert rate for 15 seconds after a nearby enemy retreats.

[b]Critical Location[/b] (Siege Breaker battlegroup): Enemies take +15% damage within 35m of the designated territory point. Lasts a minimum of 30s.

[h2]British Forces[/h2]
[table]
[tr][th]Unit[/th][th]Capture[/th][th]Revert[/th][/tr]
[tr][td][url=/explorer/races/british/units/australian_light_infantry_africa_uk]Australian Light Infantry[/url][/td][td]1.5[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/british/units/canadian_heavy_infantry_africa_uk]Canadian Shock Troops[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/british/units/canadian_heavy_infantry_africa_uk]Canadian Shock Troops[/url] vet 3[/td][td]1.33[/td][td]1.33[/td][/tr]
[tr][td][url=/explorer/races/british/units/commando_africa_uk]Commandos[/url][/td][td]1.33[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/british/units/commando_lmg_africa_uk]Commando Support[/url][/td][td]1.33[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/british/units/guards_africa_uk]Foot Guards[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/british/units/gurkhas_africa_uk]Gurkhas[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/british/units/tommy_africa_uk]Infantry Section[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/british/units/polish_lancer_africa_uk]Polish Lancers[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/british/units/sapper_africa_uk]Royal Engineers[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/british/units/ssb_africa_uk]SSB Commandos[/url][/td][td]1.33[/td][td]1.25[/td][/tr]
[tr][td][url=/explorer/races/british/units/ssb_africa_uk]SSB Commandos[/url] vet 2[/td][td]2[/td][td]1.875[/td][/tr]
[tr][td][url=/explorer/races/british/units/ssb_sniper_africa_uk]SSB Sniper[/url][/td][td]1.33[/td][td]1[/td][/tr]
[/table]

Every British squad captures faster than 1, but capture bonuses from upgrades and veterancy are rarer than for the other factions. The vet 3 Canadian Shock Troops and vet 2 SSB Commandos are the only ones, and the [url=/explorer/races/british/units/churchill_crocodile_africa_uk]Churchill Crocodile[/url] can capture and revert at vet 3.

[h3]British territory abilities[/h3]
[b]Naval Blockade[/b] (Air and Sea battlegroup): Stops one friendly territory point from being captured for 30 seconds, for 45 munitions and with a 120 second recharge.

[note title="Patch 2.2" color="blue"]Changed Naval Blockade from a global to a targeted ability.[/note]

[img alt="A point under the old Naval Blockade with its tooltip" caption="Naval Blockade as it worked in the video."]/images/wiki/territory-capture-rates/naval-blockade.webp[/img]

[b]Burnout[/b] (Canadian Shock battlegroup): drops incendiary bombs on an enemy point for 35 seconds and reverts it at a rate equivalent to 2x decapture speed, unless the enemy keeps a unit inside the circle to prevent it. After reverting, the territory is 100% faster to capture and decapture for 60s.

[img alt="A point burned by Burnout with the ability tooltip" caption="After Burnout neutralizes a point it is quicker to capture for 60 seconds."]/images/wiki/territory-capture-rates/burnout.webp[/img]

[b]Scorched Earth (Special Service battlegroup)[/b]: Destroys a territory point, rendering it neutral and requiring repairs before it can be captured.

[b]Ultra (Special Service battlegroup)[/b]: Provides 35m vision around the targeted territory or victory point for 30s.

[h2]Deutsches Afrikakorps[/h2]
[table]
[tr][th]Unit[/th][th]Capture[/th][th]Revert[/th][/tr]
[tr][td][url=/explorer/races/dak/units/assault_panzergrenadier_ak]Assault Grenadiers[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/bersaglieri_ak]Bersaglieri[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/guastatori_ak]Guastatori[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/panzergrenadier_ak]Panzergrenadiers[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/panzerjaeger_inf_ak]Panzerjäger[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/panzerpioneer_ak]Panzerpioneers[/url][/td][td]1.15[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/halftrack_250_vampire_ak]Funkpanzerwagen[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/kradschutzen_motorcycle_ak]Kradschützen[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/kradschutzen_motorcycle_ak]Kradschützen[/url] vet 3[/td][td]1.875[/td][td]1.5[/td][/tr]
[tr][td][url=/explorer/races/dak/units/armored_tractor_254_ak]Recon Tractor[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/folgore_paratroopers_ak]Folgore Paratroopers[/url][/td][td]1.33[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/kriegsmarine_infantry_ak]Kriegsmariners[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/armored_car_8_rad_command_ak]Command 8 Rad[/url][/td][td]1.25[/td][td]1[/td][/tr]
[tr][td][url=/explorer/races/dak/units/armored_car_8_rad_command_ak]Command 8 Rad[/url] vet 3[/td][td]1.875[/td][td]1[/td][/tr]
[/table]

Only the vet 3 Kradschützen has a revert rate bonus.

Other vehicles can capture/revert through the Armory with [b]Survival Package[/b] at a rate of 1.5.

[h3]Afrikakorps territory abilities[/h3]
[b]Mechanized Advance[/b]: a vet 1 passive for the Panzergrenadiers. +33% capture rate while they are inside or on top of a vehicle, and it lasts 30 seconds after disembarking.

[b]Vehicle Support: Secure Location[/b] (Italian Combined Arms battlegroup): +50% capture and revert rate for infantry near a friendly vehicle. It also works with allied vehicles.
[note title="Patch 3.0" color="blue"]Changed the capture and revert rate buff from 25% to 50%.[/note]


[b]Sound the Alarm[/b] (Italian Infantry battlegroup): use it on a friendly point to get vision of the area and slow the enemy's revert by 60% for 45s. It also helps allied units in the territory.
[note title="Error" color="blue"]The tooltip lists +250%, this is a mistake. It takes +150% longer, or 2.5 times as long.[/note]

[img alt="Sound the Alarm used on a friendly point" caption="Sound the Alarm gives vision and makes the point much slower to revert."]/images/wiki/territory-capture-rates/sound-the-alarm.webp[/img]

[b]Territory Booby Traps[/b] (Italian Infantry battlegroup): a booby trap planted on a territory point, once triggered, slows the enemy's capture of that point by 50% for the next 20 seconds.

[b]Early Warning[/b] (Panzerjäger Kommando battlegroup): gives 10m of vision around the flags of friendly points. Also allows territory points to be designated for an additional +25 vision range.

[img alt="Early Warning tooltip with vision around a point" caption="Early Warning brings back vision around your flags."]/images/wiki/territory-capture-rates/early-warning.webp[/img]

[b]Sector Subterfuge Beacon[/b] (Battlefield Espionage battlegroup): A structure that provides 50% of the resources from an enemy munitions or fuel point. When in friendly territory, points take 50% longer to decapture.

[b]Daring Assault[/b] (Elite Forces battlegroup): Gives targeted unit an additional +1 decapture speed (linear) for 60s. Vehicles that cannot decapture can with a rate of 2. Due to an oversight, the command 8rad gets +2 to its decapture rate.
`.trim(),
};

export default article;
