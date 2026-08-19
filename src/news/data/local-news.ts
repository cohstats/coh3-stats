export type LocalNewsItem = {
  /** Must start with "local-" to avoid Steam gid collisions. */
  gid: `local-${string}`;
  title: string;
  author?: string;
  /** Unix timestamp in seconds. */
  date: number;
  image?: string | null;
  url?: string | null;
  contents?: string;
};

/**
 * Site news articles shown alongside Steam announcements.
 * Add new posts as objects in this array.
 */
const localNews: LocalNewsItem[] = [
  {
    gid: "local-announce-ladder-tournament",
    title: "Ladder Tournament Season #1 Grand Final",
    author: "Ladder Tournament",
    date: 1787153270,
    image: "/images/news/ladder-tournament.webp",
    url: "https://laddertournament.com.br/",
    contents: `
[img]/images/news/ladder-tournament.webp[/img]

[p]Just a quick heads-up, the coh3 ladder tournament season #1 final is today.[/p]

[h2]The finalists are:[/h2]

[p]Lem22 / vonMises / Cunha vs Lion Heart / SaNgar / Mr.Sipan[/p]

[h2]Livestream details[/h2]

[p][url=https://www.youtube.com/@Alekelgames]AlekelGames[/url] will be streaming in portuguese today at 9 PM BRT / 8 PM EDT / 7 PM CDT / 6 PM MDT / 5 PM PDT / 12 AM BST[/p]

[p]The other english-speaking casters will be streaming the matches on different days.[/p]

[p]We’ll have both english and brazilian casters covering the final, so everyone can follow the action in their preferred language.[/p]

[p][url=https://laddertournament.com.br/]On the official ladder tournament website[/url], as soon as the stream is ready, “live” will show up in the menu. just keep an eye on it there.[/p]

[h2]For more information[/h2]

[p]if you want to join us for the next season, visit our [url=https://discord.gg/HQxUnjcrNd]discord[/url]Official Discord[/p]

[p][url=https://laddertournament.com.br/]Visit the Official Website[/url][/p]

`.trim(),
  },
  {
    gid: "local-announce-ladder-tournament",
    title: "New Ladder Tournament Project for COH3",
    author: "Ladder Tournament",
    date: 1785604604,
    image: "/images/news/ladder-tournament.webp",
    url: "https://laddertournament.com.br/",
    contents: `
[img]/images/news/ladder-tournament.webp[/img]

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
