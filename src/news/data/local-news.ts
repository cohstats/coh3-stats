import { NewsCategory } from "../news-categories";

export type LocalNewsItem = {
  /** Must start with "local-" to avoid Steam gid collisions. */
  gid: `local-${string}`;
  title: string;
  /** Used to filter the /news page. Site posts are usually "tournaments" or "coh3stats". */
  category: NewsCategory;
  author?: string;
  /** Unix timestamp in seconds. */
  date: number;
  image?: string | null;
  /** Hide the homepage overlay and display the full image without cropping. */
  imageOnly?: boolean;
  url?: string | null;
  contents?: string;
};

/**
 * Site news articles shown alongside Steam announcements.
 * Add new posts as objects in this array.
 */
const localNews: LocalNewsItem[] = [
  {
    gid: "local-ironclad-hold-the-line",
    title: "HOLD THE LINE — Four Divisions, Up to US$280",
    category: "tournaments",
    author: "IronClad Tournaments",
    date: 1792972800, // 26 October 2026, 00:00 UTC; local review date.
    image: "/images/news/ironclad-hold-the-line-carousel.webp",
    imageOnly: true,
    url: "https://www.ironcladtournaments.com/tournaments?tournament=hold-the-line&register=1",
    contents: `
[img]/images/news/ironclad-hold-the-line.webp[/img]

[p][b]Registration is open for IronClad’s next international Company of Heroes 3 1v1 tournament, with free entry and cash prizes across four verified ELO Divisions.[/b][/p]

[p]The line is forming again.[/p]

[p]Following the completion of [b]THE NEW FRONT[/b], IronClad Tournaments has opened registration for [b]HOLD THE LINE[/b], its next international Company of Heroes 3 1v1 competition.[/p]

[p][b][url=https://www.ironcladtournaments.com/tournaments?tournament=hold-the-line&register=1]REGISTER FOR HOLD THE LINE[/url][/b][/p]

[p]Entry is free, with [b]up to US$280 in cash prizes[/b] distributed across four competitive Divisions: Academy, Challenge, Main and Pro.[/p]

[p]Each Division has its own eight-player field and launches independently once eight approved competitors are ready.[/p]

[h2]Compete at your level[/h2]

[p]You do not need a Pro-level rating to compete for a tournament title and a cash prize.[/p]

[p]HOLD THE LINE places players into the Division matching their verified 1v1 ELO, giving competitors across the CoH3 ladder a structured tournament field appropriate to their current competitive level.[/p]

[list]
[*][b]Academy[/b] — verified 1v1 ELO 0–1099 — [b]US$40 winner prize[/b][/*]
[*][b]Challenge[/b] — verified 1v1 ELO 1100–1399 — [b]US$60 winner prize[/b][/*]
[*][b]Main[/b] — verified 1v1 ELO 1400–1699 — [b]US$80 winner prize[/b][/*]
[*][b]Pro[/b] — verified 1v1 ELO 1700+ — [b]US$100 winner prize[/b][/*]
[/list]

[p]Four Divisions. Four champions. A cash prize at every level.[/p]

[p]Once a Division reaches eight approved players, IronClad can prepare and launch that bracket independently without waiting for every other Division to fill.[/p]

[h2]The Pro Final — cast by HelpingHans[/h2]

[p]The [b]HOLD THE LINE Pro Division Final will be cast by HelpingHans[/b].[/p]

[p]The dedicated 1700+ field will culminate with its finalists competing for the Pro title and the [b]US$100 winner prize[/b].[/p]

[h2]Create your competitive identity[/h2]

[p]IronClad competition extends beyond a single tournament registration.[/p]

[p]Players create their IronClad competitive profile, connect their Steam identity and verify their current Relic 1v1 ELO before competing in the Division for which they are eligible.[/p]

[p]Tournament participation, match results and competitive progression then contribute to a continuing IronClad record through dashboard history and IronClad rankings.[/p]

[p]Profiles, verified ELO placement, tournament registration, brackets, match reporting and replay-supported evidence all sit within the same competitive platform.[/p]

[p][b]HOLD THE LINE is the next opportunity to add to that record.[/b][/p]

[h2]From THE NEW FRONT to HOLD THE LINE[/h2]

[p]THE NEW FRONT was the first tournament hosted directly through the new IronClad platform. The event filled [b]24 of 24 available places[/b] and completed all [b]21 scheduled matches[/b].[/p]

[h2]THE NEW FRONT Champions[/h2]

[p][b]Academy — DarthYukat[/b][/p]
[p][b]Challenge — GL1TCH[/b][/p]
[p][b]Main / Pro — Reakly[/b][/p]

[p]HOLD THE LINE gives players across four Divisions the opportunity to become IronClad’s next tournament champions.[/p]

[h2]How to enter[/h2]

[list=1]
[*][b]Create or sign into your IronClad account[/b] and save your competitive profile.[/*]
[*][b]Connect your Steam account[/b], then use [b]Verify ELO[/b] on your Profile page to verify your current Relic 1v1 rating.[/*]
[*][b]Register for your eligible HOLD THE LINE Division[/b], review the rules, complete the required agreements and submit your entry for approval.[/*]
[*][b]Follow your approval status in the Dashboard.[/b][/*]
[*]Once eight players are approved, IronClad prepares and launches that Division independently.[/*]
[/list]

[p]Players must be 18 or older and meet the published eligibility requirements. IronClad checks your current ELO again when you submit.[/p]

[p][b]Free entry. Four Divisions. Cash prizes across the ladder.[/b][/p]

[p][url=https://www.ironcladtournaments.com]https://www.ironcladtournaments.com[/url][/p]
`.trim(),
  },
  {
    gid: "local-meta-plays-coh-20th-anniversary-league",
    title: "Company of Heroes 20th Anniversary League",
    category: "tournaments",
    author: "Meta Plays",
    date: 1792152559,
    image: "/images/news/coh-20th-anniversary-league.webp",
    url: "https://meta-plays.com/news/companyofheroes3/20th-anniversary/",
    contents: `
[img]/images/news/coh-20th-anniversary-league.webp[/img]

[p]We're pleased to announce the Company of Heroes 20th Anniversary League sponsored by Relic![/p]

[p]With [b]$4,000[/b] on the line, we will hold two qualifier events, where the top players will be invited to the main event - all that make it there will get a share of the prizes.[/p]

[p]Check out our [url=https://meta-plays.com/news/companyofheroes3/20th-anniversary/]news article[/url] for more details.[/p]

[h2]Qualifiers[/h2]

[p]The qualifiers start [b]November 5th[/b] and [b]November 15th[/b] respectively, and will be a relaxed format where you can schedule your own matches. Live streams will happen November 15th and 29th respectively.[/p]

[p]You can sign up now for both:[/p]
[list]
[*][url=https://meta-plays.com/tournaments/company-of-heroes-3/coh-20th-anniv-q1/]Qualifier 1[/url][/*]
[*][url=https://meta-plays.com/tournaments/company-of-heroes-3/coh-20th-anniv-q2/]Qualifier 2[/url][/*]
[/list]

[h2]Main Event[/h2]

[p]The main event's group stage will be played and streamed live [b]December 5th and 6th[/b], while the final stage will take place [b]December 12th and 13th[/b].[/p]

[h2]Watch[/h2]

[p]Follow the official Company of Heroes YouTube and Relic Twitch channels, as well as the Meta Plays Twitch and YouTube, to catch all the games. The caster line up will include Olvadi, as well as Greyshot, Turin, Shark, and of course Stormless![/p]
`.trim(),
  },
  {
    gid: "local-ladder-tournament-season-2-registration",
    title: "Ladder Tournament - Season 2 Registration",
    category: "tournaments",
    author: "Ladder Tournament",
    date: 1791034176,
    image:
      "https://laddertournament.com.br/assets/banner-blood-and-steel-lt-season-2-coh3stats.jpg",
    url: "https://laddertournament.com.br/",
    contents: `
[img]https://laddertournament.com.br/assets/banner-blood-and-steel-lt-season-2-coh3stats.jpg[/img]

[h2]Ladder Tournament Season 2: Blood & Steel is coming soon![/h2]

[p]Registration opens October 5th. For registration fees, prize details, and more information, check out our [url=https://laddertournament.com.br/]official website[/url] or [url=https://discord.gg/HQxUnjcrNd]discord server[/url].[/p]

[previewyoutube=Jq4UVUk29o4;full][/previewyoutube]

`.trim(),
  },
  {
    gid: "local-final-stand-full-coverage",
    title: "COH3 Stats - Final Stand now fully covered",
    category: "coh3stats",
    author: "COH3 Stats",
    date: 1788163921,
    contents: `
[p]The Explorer now covers the whole Final Stand DLC (co-op vs AI): the technology draft, the perk trees and the DLC-only unit rosters, for all four factions.[/p]

[h2]Technologies[/h2]

[p]Every technology that can be offered in a run, pick by pick: [url=https://coh3stats.com/explorer/fs/races/american/tech]US Forces[/url] / [url=https://coh3stats.com/explorer/fs/races/british/tech]British Forces[/url] / [url=https://coh3stats.com/explorer/fs/races/german/tech]Wehrmacht[/url] / [url=https://coh3stats.com/explorer/fs/races/dak/tech]Deutsches Afrikakorps[/url][/p]

[h2]Perks[/h2]

[p]The complete perk tree with all tiers, levels, effects and perk point costs: [url=https://coh3stats.com/explorer/fs/races/american/perks]US Forces[/url] / [url=https://coh3stats.com/explorer/fs/races/british/perks]British Forces[/url] / [url=https://coh3stats.com/explorer/fs/races/german/perks]Wehrmacht[/url] / [url=https://coh3stats.com/explorer/fs/races/dak/perks]Deutsches Afrikakorps[/url][/p]

[h2]Units[/h2]

[p]The Final Stand-only units, with full unit stats: [url=https://coh3stats.com/explorer/fs/races/american/units]US Forces[/url] / [url=https://coh3stats.com/explorer/fs/races/british/units]British Forces[/url] / [url=https://coh3stats.com/explorer/fs/races/german/units]Wehrmacht[/url] / [url=https://coh3stats.com/explorer/fs/races/dak/units]Deutsches Afrikakorps[/url][/p]
[p]You can also search for FS units using the page search.[/p]

[p]As always, if you spot something wrong or missing, let us know on our [url=https://discord.com/invite/4Bj2y84WAR]Discord[/url].[/p]
`.trim(),
  },
  {
    gid: "local-ladder-tournament-season1-final",
    title: "Ladder Tournament Season #1 Grand Final",
    category: "tournaments",
    author: "Ladder Tournament",
    date: 1787153270,
    image: "https://laddertournament.com.br/assets/banner-lt-coh3stats.jpg",
    url: "https://laddertournament.com.br/",
    contents: `
[img]https://laddertournament.com.br/assets/banner-lt-coh3stats.jpg[/img]

[p]Just a quick heads-up, the coh3 ladder tournament season #1 final is today.[/p]

[h2]The finalists are:[/h2]

[p][url=https://coh3stats.com/players/366826/lem22]Lem22[/url] / [url=https://coh3stats.com/players/31145/vonMises]vonMises[/url] / [url=https://coh3stats.com/players/153969/Cunha]Cunha[/url] vs [url=https://coh3stats.com/players/59864/LionHeart]Lion Heart[/url] / [url=https://coh3stats.com/players/991764/SaNgarBR]SaNgar[/url] / [url=https://coh3stats.com/players/487/RiPMrSipan]Mr.Sipan[/url][/p]

[h2]Livestream details[/h2]

[p][url=https://www.youtube.com/@Alekelgames]AlekelGames[/url] will be streaming in portuguese today at 9 PM BRT / 8 PM EDT / 7 PM CDT / 6 PM MDT / 5 PM PDT / 12 AM BST[/p]

[p]The other english-speaking casters will be streaming the matches on different days.[/p]

[p]We’ll have both english and brazilian casters covering the final, so everyone can follow the action in their preferred language.[/p]

[p][url=https://laddertournament.com.br/]On the official ladder tournament website[/url], as soon as the stream is ready, “live” will show up in the menu. just keep an eye on it there.[/p]

[h2]For more information[/h2]

[p]if you want to join us for the next season, visit our [url=https://discord.gg/HQxUnjcrNd]Official Discord[/url][/p]

[p][url=https://laddertournament.com.br/]Visit the Official Website[/url][/p]

`.trim(),
  },
  {
    gid: "local-announce-ladder-tournament",
    title: "New Ladder Tournament Project for COH3",
    category: "tournaments",
    author: "Ladder Tournament",
    date: 1785604604,
    image: "https://laddertournament.com.br/assets/banner-lt-coh3stats.jpg",
    url: "https://laddertournament.com.br/",
    contents: `
[img]https://laddertournament.com.br/assets/banner-lt-coh3stats.jpg[/img]

[p]The Company of Heroes 3 community has a new competitive event: the first playoff round of our Ladder Tournament.[/p]

[p]The Ladder Tournament was created by a community of Brazilian players with a simple goal: give players another way to compete, meet other players, and stay involved with the CoH3 community.[/p]

[p]The Ladder Tournament uses a challenge-based ranking system. Teams can challenge opponents above them in the standings, and the results of those matches affect their position on the Ladder.[/p]

[p]This means teams need to keep playing if they want to move up and secure a good position. The best-ranked teams eventually advance to the Playoffs, followed by the Semifinals and Final.[/p]

[p]The tournament has its own rules covering challenges, match scheduling, results, and other situations that can happen during the competition.[/p]

[p]The Ladder Tournament team has also been talking with IronClad Tournaments and MetaPlays about ways tournament organizers can work together. One of the ideas being discussed is having a place where players can more easily find different CoH3 tournaments and events instead of having everything scattered across different communities and platforms.[/p]

[p]It's still something being worked on, but the idea is simple: make it easier for players to find tournaments and get involved.[/p]

[p]Several well-known CoH3 casters have also been helping cover Ladder Tournament matches, including HelpingHans, n7Shark, ValieriumBorn, AlekelGames, and SaNgar.[/p]

[p]Having different casters involved also means matches can reach players outside the Brazilian community and bring more attention to the tournament.[/p]

[p]The Ladder Tournament platform is still being developed. The team is currently working on features such as player registration, team management, automated challenges, rankings, and match scheduling.[/p]

[p]Ladder Tournament is a community project made by people who enjoy Company of Heroes 3 and want to see more competitive events happening around the game.[/p]

[p]If you're interested in playing, watching the matches, or simply following the development of the project, you're welcome to join the community.[/p]

[p][url=https://discord.com/invite/HQxUnjcrNd]Official Discord[/url][/p]

[p][url=https://www.youtube.com/watch?v=aU4-Jpz5zZs]Watch the Official Introduction[/url][/p]

[p][url=https://laddertournament.com.br/]Visit the Official Website[/url][/p]
`.trim(),
  },
];

export default localNews;
