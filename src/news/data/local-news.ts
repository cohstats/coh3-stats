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
    date: 1785071282,
    image: "/images/news/ladder-tournament.webp",
    url: "https://laddertournament.com.br/",
    contents: `
[img]/images/news/ladder-tournament.webp[/img]

[p]The Company of Heroes 3 community continues to take meaningful steps toward strengthening the game's competitive scene. Among the projects gaining the most attention is the Ladder Tournament, a championship created to provide an organized, accessible, and engaging competitive experience for players of all skill levels.[/p]
[p]More than just another tournament, the project aims to build a solid foundation for the future of the community by connecting players, content creators, tournament organizers, and partners who share the same vision: helping the competitive scene of Company of Heroes 3 grow in a sustainable way.[/p]

[h2]A Competition Designed to Keep Players Engaged[/h2]
[p]The Ladder Tournament features a challenge-based format, allowing teams to climb the rankings by defeating higher-ranked opponents.[/p]
[p]Every match directly impacts the standings, encouraging teams to remain active throughout the competition. At the end of the season, the highest-ranked teams qualify for the Playoffs, where they compete for the championship title.[/p]
[p]The tournament also follows a clear set of rules designed to promote fairness, transparency, and sportsmanship.[/p]

[h2]Building a Unified Tournament Ecosystem[/h2]
[p]The Ladder Tournament team is also in direct contact with IronClad Tournaments. The shared vision is to strengthen the competitive scene by working toward a unified platform where multiple community tournaments can coexist, making it easier for players to discover and participate in Company of Heroes 3 events.[/p]

[h2]Community Casters Supporting the Event[/h2]
[p]The tournament is supported by respected community casters including HelpingHans, n7Shark, ValieriumBorn, AlekelGames, and SaNgar. Their broadcasts and community engagement help increase the tournament's visibility and introduce more players to the competitive scene.[/p]

[h2]Looking Ahead[/h2]
[p]The Ladder Tournament team continues to develop new platform features, including player registration, team management, automated challenges, ranking management, and match scheduling.[/p]

[h2]A Project Built by the Community, for the Community[/h2]
[p]By bringing together organizers, players, casters, and partners, the Ladder Tournament aims to create a sustainable and welcoming competitive environment for the entire Company of Heroes 3 community.[/p]

[h2]Watch the Official Introduction[/h2]
[p][url=https://www.youtube.com/watch?v=aU4-Jpz5zZs]https://www.youtube.com/watch?v=aU4-Jpz5zZs[/url][/p]

[h2]Visit the Official Website[/h2]
[p][url=https://laddertournament.com.br/]https://laddertournament.com.br/[/url][/p]
`.trim(),
  },
];

export default localNews;
