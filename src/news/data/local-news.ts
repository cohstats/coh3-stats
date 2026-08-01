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

[h2]Ladder Discord[/h2]
[p][url=https://discord.com/invite/HQxUnjcrNd]https://https://discord.com/invite/HQxUnjcrNd[/url][/p]

[h2]Watch the Official Introduction[/h2]
[p][url=https://www.youtube.com/watch?v=aU4-Jpz5zZs]https://www.youtube.com/watch?v=aU4-Jpz5zZs[/url][/p]

[h2]Visit the Official Website[/h2]
[p][url=https://laddertournament.com.br/]https://laddertournament.com.br/[/url][/p]
`.trim(),
  },
];

export default localNews;
