/**
 * @jest-environment node
 */

import { getCOH3SteamNews } from "../../../src/apis/steam-api";
import steamNewsApiResponse from "../../test-assets/steam-news-api-response.json";

describe("getCOH3SteamNews", () => {
  const setupFetchStub = (data: any) => () =>
    Promise.resolve({ json: () => Promise.resolve(data), ok: true });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(steamNewsApiResponse));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // @ts-ignore
    global.fetch.mockClear();
  });

  it("should return the news for COH3", async () => {
    const result = await getCOH3SteamNews();
    expect(result.newsitems.length).toBe(3);
    expect(result.count).toBe(94);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1677280&feeds=steam_community_announcements&count=20",
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns correct news items", async () => {
    const result = await getCOH3SteamNews();

    for (const newsItem of result.newsitems) {
      expect(newsItem).toHaveProperty("title");
      expect(typeof newsItem.title).toBe("string");

      expect(newsItem).toHaveProperty("url");
      expect(typeof newsItem.url).toBe("string");

      expect(newsItem).toHaveProperty("author");
      expect(typeof newsItem.author).toBe("string");

      expect(newsItem).toHaveProperty("contents");
      expect(typeof newsItem.contents).toBe("string");

      expect(newsItem).toHaveProperty("image");
      expect(typeof newsItem.contents).toBe("string");

      expect(newsItem).toHaveProperty("date");
      expect(typeof newsItem.date).toBe("number");

      expect(newsItem).not.toHaveProperty("feedlabel");
      expect(newsItem).not.toHaveProperty("feedname");
      expect(newsItem).not.toHaveProperty("is_external_url");
      expect(newsItem).not.toHaveProperty("feed_type");
      expect(newsItem).not.toHaveProperty("appid");
    }
  });

  it("Verify the count", async () => {
    // the fakedata Should have only 1 item in the newsitems array from steamNewsApiResponse
    const fakeData = {
      appnews: {
        appid: 1677280,
        newsitems: [
          {
            gid: "1",
            title: "Test Title",
            url: "https://testurl.com",
            is_external_url: false,
            author: "Test Author",
            contents: "Test Contents",
            feedlabel: "Test Feedlabel",
            date: 1633029600,
            feedname: "steam_community_announcements",
            feed_type: 1,
            appid: 1677280,
            tags: [],
          },
        ],
        count: 1,
      },
    };

    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeData));

    const result = await getCOH3SteamNews(1);
    expect(result.count).toBe(1);
    expect(result.newsitems.length).toBe(1);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1677280&feeds=steam_community_announcements&count=1",
    );
  });

  it("Verify the image response", async () => {
    const fakeData = {
      appnews: {
        appid: 1677280,
        newsitems: [
          {
            gid: "1801617199364974",
            title: "2.1.0 Opal Scorpion Update",
            url: "https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1801617199364974",
            is_external_url: true,
            author: "Hannah_RE",
            contents:
              "[img]{STEAM_CLAN_IMAGE}/40883127/2ca8a2de5ed3c8f837cde6efa19adb155f0f08ef.jpg[/img]\n" +
              "\n" +
              "Summer is just around the corner, and with it comes the 2.1.0 Opal Scorpion Update! \n" +
              "[list]\n" +
              "[*]New Maps\n" +
              "[*]Multiplayer Balance Changes\n" +
              "[*]New Cosmetics\n" +
              "[/list]Releasing on June 24, stay tuned for more details!\n" +
              "\n",
            feedlabel: "Community Announcements",
            date: 1749056689,
            feedname: "steam_community_announcements",
            feed_type: 1,
            appid: 1677280,
            tags: [],
          },
        ],
        count: 1,
      },
    };

    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeData));

    const result = await getCOH3SteamNews(1);
    expect(result.newsitems[0].image).toBe(
      "https://clan.cloudflare.steamstatic.com/images/40883127/2ca8a2de5ed3c8f837cde6efa19adb155f0f08ef.jpg",
    );
    expect(result.newsitems[0].title).toBe("2.1.0 Opal Scorpion Update");
  });

  it("Verify the image response v2 ", async () => {
    // This is something which started failing on June 24 / 2025
    const fakeData = {
      appnews: {
        appid: 1677280,
        newsitems: [
          {
            gid: "1802893906864255",
            title: "Opal Scorpion (2.1.0) Mission Briefing",
            url: "https://steamstore-a.akamaihd.net/news/externalpost/steam_community_announcements/1802893906864255",
            is_external_url: true,
            author: "Hannah_RE",
            contents:
              '[p][img src="{STEAM_CLAN_IMAGE}/40883127/84ea2fc7a272ca71a9b74aaccdf1981d99b67e20.jpg"][/img][/p][h1][b]Overview[/b] [/h1][p]The [b]Opal Scorpion (2.1.0)[/b] update will be available for download on [b]Tuesday, June 24th, 2025[/b]. This update includes 5 new maps, multiplayer balance changes, new cosmetics, and more! For full details, you can check out the patch notes tomorrow morning.  [/p][p]You can get all the details in our Opal Scorpion Deep Dive with the team! [/p][p][/p][previewyoutube="Ez_k6mKs2w8;full"][/previewyoutube][h1]Maps [/h1][p]The 2.1.0 Opal Scorpion update sees the addition of five new maps to all game modes. Maps selected from community creators have been worked on in tandem with our team to get them ready for the automatch map pool.  [/p][h3][b]Tuscan Vineyards – 1 vs 1[/b] [/h3][p]Community mapmaker[b] Kpen[/b] returns with this competitive 1vs1 map, set in a lush Italian landscape. Players will be fighting in and amongst dense hedgerows and exposed river crossings to secure victory in this beautifully realized battlefield.[b] [/b] [/p][h3][b]El Alamein – 2 vs 2[/b] [/h3][p]The turning point of the war in North Africa, this infamous, yet seemingly insignificant railstop was a must-have addition to Company of Heroes 3. Players will be hard-pressed to secure all the territory they desire and will need to work together to carve out resources that suit their playstyle. Wide, open desert flank the central rail compound and what cover is available will not last for long. [/p][h3][b]Lorraine – 2 vs 2[/b] [/h3][p]Community mapmaker[b] TheSphinx[/b] also makes their return with this wonderful rendition of Company of Heroes 1 Lorraine - a 2v2 favorite. Their eye for detail has left no stone unturned in this painstaking recreation of a bombed rural town.[b] [/b] [/p][h3][b]Gabès Gap – 3 vs 3[/b] [/h3][p]Players will take command of the battle of Wadi Akarit, a single roadway bisecting the salt flats and outcroppings of the West, and the beaches to the East. While direct conflict is to be expected among the flat, desolate shrub of the map center, there is too much value to be had in capturing the fortified beaches and highlands to either side. Neglecting either of these battlefields will open your entire team to dangerous cut-offs and flanking maneuvers. [/p][h3][b]Red Ball Express – 4 vs 4[/b] [/h3][p]We are also very proud to announce the debut of Community mapmaker [b]DutchToast[/b] and their rendition of the Company of Heroes classic Red Ball Express. An exceptional amount of work has been poured into this map (4v4 is no joke) and its name should be familiar to Company of Heroes 1 and 2 fans alike. Players should expect the same grinding advances down forested lanes and daring spearheads through enemy defenses. [/p][h1]New Cosmetics[/h1][p]With this update we are introducing 4 new Legendary cosmetic sets – one for each faction. These sets will be available for either Merit or War Bonds. [/p][h3][b]US Forces - Amphibious Assault[/b] [/h3][p]Though synonymous with the Pacific Front, the Island hopping and beach assaults of the Italian mainland felt all too fitting a place to represent the US Marine Corps in all their frog-skin splendor. [/p][p][img src="{STEAM_CLAN_IMAGE}/40883127/69b7edd126f5a7346410315099bc28510bb7f9e9.png"][/img][/p][h3][b]Wehrmacht - War Torn[/b] [/h3][p]This worn and weather-beaten scheme represents the Wehrmacht towards their bitter end. We designed the War Torn pack to represent vehicles, soldiers and matériel in a state of desperate disrepair. [/p][p][img src="{STEAM_CLAN_IMAGE}/40883127/7bc7ce88235c8872fd224355c2f623fc75eb980e.png"][/img][/p][h3][b]British Forces - Desert Rose[/b] [/h3][p]This lesser known but striking scheme was a must-have addition to our British army in Africa. Tinted to mimic the light of dawn or dusk against the sand, this scheme was intended to protect convoys of vehicles on their way to strike targets from deep in the desert. [/p][p][img src="{STEAM_CLAN_IMAGE}/40883127/cc5a2a5cfb7dcf683d1987dbafd5e74ffc4873dc.png"][/img][/p][h3][b]Deutsches Afrikakorps - Desert Cats[/b] [/h3][p]The Afrikakorps employed exceptional ambush tactics within their desert realm, personified by the Desert Cats pack. Use natural sepia and artificial shadows to obscure your forces as they maneuver to ambush their foe. [/p][p][img src="{STEAM_CLAN_IMAGE}/40883127/4c954d7231508fc3d3728abac2021e30684b38f0.png"][/img][/p][h3][b]Exclusive Nightfighters Packs[/b] [/h3][p]Previously, the Nightfighter cosmetic packs were exclusive to players with a Prime Gaming subscription. After the Opal Scorpion update, they will now be coming to the in-game store. These sets will roll out gradually over the coming weeks and months, meaning all players will finally be able to collect them all. These packs will be available for either Merit or War Bonds.  [/p][h1]Game Improvements [/h1][p]This update also includes several gameplay and quality of life improvements.  [/p][list][*][p]Breach – this system has had a complete overhaul to make it more reliable and consistent. Among other things, Breach can now be cancelled at any stage prior to the ability causing damage. Breach has been significantly sped up, and units that are Breaching will teleport into the building if the enemy exits, rather than attempting to walk in through the doors/complete the Breach animation. [/p][/*][/list][list][*][p]Towing – Towing will be faster and more responsive. [/p][/*][/list][list][*][p]Instant-Reload Abilities – We have made several improvements to non-lethal weapons to bypass a weapon reload time. These changes are meant to make it easier to deploy smoke screens during combat when units have already fired a shot and are in their reload cycle.  [/p][/*][/list][list][*][p]Auto-Reinforce – will no longer cancel when moving out of reinforce range. [/p][/*][/list][list][*][p]Improved Capture Behavior – When units are given a direct move to a capture point and not on a capture point, squad entities will move to the center of the point, favoring the side they come from. Squads will no longer move closer to capture points if they are already within a capture point, allowing players to leverage desirable cover within a point, order a capture command on the point and retain the cover position. [/p][/*][/list][list][*][p]Wrecks Persist More – Wrecks could too easily be destroyed by vehicles crushing them. This meant killing the lead vehicle of a tank assault did little to slow them down. Additionally, wrecks that players wanted to salvage could accidentally be destroyed by most mid-to-late game units. We have made a change to most wreck types where they require a higher unit weight class to be crushed, except for heavy vehicle wrecks which can never be crushed. [/p][/*][/list][list][*][p]The game is now also localized in Ukrainian and Russian.[/p][/*][/list][h1]Multiplayer Balance Changes [/h1][p]You can find the full list of balance changes in tomorrow patch notes, but here a quick overview. [/p][list][*][p]Grenade Improvements – Basic Grenades will do more damage with direct hits and will feel more impactful [/p][/*][/list][list][*][p]Improved Stealth – The stealth features of Battlefield Espionage have been reworked to be less oppressive. Changes have been made to the stealth auras provided by the Funkwagon and the Intel Radio Beacons so that they now provide standard camouflage to units that are in cover, with a short grace period when leaving it. Units will now require more thoughtful placement on the battlefield to gain their camouflage.  [/p][/*][/list][list][*][p]Artillery – emplacement artillery has been made more durable to better counter mobile artillery. Additionally, units like the Walking Stuka have been changed to better reflect their impact across game modes. [/p][/*][/list][list][*][p]Minesweeping – It was difficult for minesweeper units to gain veterancy due to their limited combat potential after being locked out of their weapon upgrades. Minesweeping now provides experience to the sweeping unit to reward them for support tasks. [/p][/*][/list][list][*][p]Unit Distinction and Veterancy – several units have received new abilities or had their Veterancy bonuses adjusted as part of our ongoing Unit Distinction work [/p][/*][/list][p]The Opal Scorpion (2.1.0) update is out on Steam on Tuesday, June 24th, 2025, at 10am PST! Join our [url="https://discord.com/invite/relicentertainment"][u]official Discord[/u][/url] to discuss the update and find others to play with.  [/p]',
            feedlabel: "Community Announcements",
            date: 1750697854,
            feedname: "steam_community_announcements",
            feed_type: 1,
            appid: 1677280,
            tags: ["mod_reviewed", "ModAct_487176015_1750698743_0", "mod_require_rereview"],
          },
        ],
        count: 1,
      },
    };

    // @ts-ignore
    jest.spyOn(global, "fetch").mockImplementation(setupFetchStub(fakeData));

    const result = await getCOH3SteamNews(1);
    expect(result.newsitems[0].image).toBe(
      "https://clan.cloudflare.steamstatic.com/images/40883127/84ea2fc7a272ca71a9b74aaccdf1981d99b67e20.jpg",
    );
    expect(result.newsitems[0].title).toBe("Opal Scorpion (2.1.0) Mission Briefing");
  });
});
