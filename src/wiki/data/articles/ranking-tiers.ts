import { PlayerRanks } from "../../../coh3/coh3-data";
import { WikiArticle } from "../../wiki-types";

const formatElo = ({ min, max }: { min: number; max: number }) =>
  max === 5000 ? `${min}+` : `${min} - ${max}`;

// Built from the same data the site uses to show the tiers, so the table can't drift.
const regularTierRows = Object.values(PlayerRanks)
  .filter((tier) => tier.min >= 0 && tier.rank === 0)
  .sort((a, b) => a.min - b.min)
  .map((tier) => `[tr][td]${tier.name}[/td][td]${formatElo(tier)}[/td][/tr]`)
  .join("\n");

const challengerRows = Object.values(PlayerRanks)
  .filter((tier) => tier.rank > 0)
  .sort((a, b) => a.rank - b.rank)
  .map((tier, index, tiers) => {
    const from = index === 0 ? 1 : tiers[index - 1].rank + 1;
    const positions = from === tier.rank ? `${from}` : `${from} - ${tier.rank}`;
    return `[tr][td]${tier.name}[/td][td]${positions}[/td][/tr]`;
  })
  .reverse()
  .join("\n");

const article: WikiArticle = {
  slug: "ranking-tiers",
  category: "ranked",
  title: "Ranking Tiers and Leagues",
  summary:
    "How the ranked ladder in Company of Heroes 3 works: the leagues and tiers, the ELO each one needs, how Challenger is decided and how rank and ELO decay.",
  authors: [{ name: "pagep" }],
  date: "2026-11-26",
  tags: ["ranked", "elo", "tiers", "leagues", "challenger", "leaderboards"],
  order: 1,
  contents: `
Every ranked player in Company of Heroes 3 sits in a [b]league[/b] and a [b]tier[/b] inside it. The tier is just a badge for your ELO rating, the number the matchmaking actually uses. This page lists every tier, the ELO it needs and the few rules around it.

[img alt="The six leagues: Brass, Bronze, Iron, Silver, Gold and Challenger" caption="The six leagues, from Brass on the left to Challenger on the right."]/images/wiki/ranking-tiers/leagues.webp[/img]

[note title="TL;DR"]Play 10 matches with a faction in a mode to get placed. Your tier follows your ELO from Brass 3 up to Gold 1 at 1600. Above 1600, only the top 50 players of each leaderboard get a Challenger badge.[/note]

[h2]Getting placed[/h2]
Each faction in each game mode (1v1, 2v2, 3v3, 4v4) is its own leaderboard with its own ELO and its own tier. Until you have played [b]10 matches[/b] with a faction in a mode, you are shown as [b]Placement[/b] on that leaderboard and you don't have a rank there yet.

So you can be Gold with the Wehrmacht in 1v1 and still in Placement with the British in 2v2.

[h2]Leagues and tiers[/h2]
There are five regular leagues with three tiers each, tier 3 being the lowest and tier 1 the highest. Your tier is decided by your ELO alone:
[table]
[tr][th]Tier[/th][th]ELO rating[/th][/tr]
${regularTierRows}
[/table]
The ranges are not even. Brass and Bronze 3 cover a lot of ELO each, while from Bronze 2 up to Silver 1 a tier is only 50 ELO wide, so a good or bad evening can move you a tier or two.

[h2]Challenger[/h2]
Challenger is the top league and it works differently. It is not about the ELO alone but about your [b]position on the leaderboard[/b]. You need at least [b]1600 ELO[/b] and to be among the top 50 players of that leaderboard:
[table]
[tr][th]Tier[/th][th]Leaderboard position[/th][/tr]
${challengerRows}
[/table]
Challenger 1 is the number one player of the leaderboard. With 1600+ ELO but outside the top 50 you stay in [b]Gold 1[/b], so Gold 1 has no upper ELO limit.

[h2]Rank decay[/h2]
If you don't play on a leaderboard for an extended period, you lose your rank there and drop back to unranked. It isn't gone for good, a single match on that leaderboard brings it back.

[h2]ELO decay[/h2]
The ELO itself can decay as well. When a player stays inactive for a long time, their rating can be lowered without them playing any game. This keeps inactive accounts from sitting at the top of the leaderboards forever.

[h2]Where to see your tier[/h2]
Your tier for every faction and mode is shown on your player profile, search for your name in the top bar. The [url=/leaderboards]leaderboards[/url] show the tier of every player next to their ELO, which is also the quickest way to check how far you are from the top 50.
`.trim(),
};

export default article;
