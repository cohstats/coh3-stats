import packageJson from "./package.json";
const { repository } = packageJson;

const config = {
  DiscordInviteLink: "https://discord.gg/jRrnwqMfkr",
  DonationLink: "https://ko-fi.com/cohstats",
  GitHubLink: repository.url,
};

export default config;
