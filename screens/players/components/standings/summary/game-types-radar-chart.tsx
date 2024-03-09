import { ResponsiveRadar } from "@nivo/radar";
import { InternalStandings } from "../../../../../src/coh3/coh3-types";

const GameTypesRadarChart = ({ playerStandings }: { playerStandings: InternalStandings }) => {
  type GameType = "1v1" | "2v2" | "3v3" | "4v4";
  type DataValues = Record<
    GameType,
    {
      wins: number;
      losses: number;
    }
  >;
  const dataValues: DataValues = {
    "1v1": {
      wins: 0,
      losses: 0,
    },
    "2v2": {
      wins: 0,
      losses: 0,
    },
    "3v3": {
      wins: 0,
      losses: 0,
    },
    "4v4": {
      wins: 0,
      losses: 0,
    },
  };

  for (const faction of Object.values(playerStandings)) {
    (["1v1", "2v2", "3v3", "4v4"] as GameType[]).forEach((gameType) => {
      const gameData = faction[gameType];
      if (gameData) {
        dataValues[gameType].wins += gameData.wins;
        dataValues[gameType].losses += gameData.losses;
      }
    });
  }

  const data = [
    {
      taste: "1v1",
      games: dataValues["1v1"].wins + dataValues["1v1"].losses,
      wins: dataValues["1v1"].wins,
      losses: dataValues["1v1"].losses,
    },
    {
      taste: "2v2",
      games: dataValues["2v2"].wins + dataValues["2v2"].losses,
      wins: dataValues["2v2"].wins,
      losses: dataValues["2v2"].losses,
    },
    {
      taste: "3v3",
      games: dataValues["3v3"].wins + dataValues["3v3"].losses,
      wins: dataValues["3v3"].wins,
      losses: dataValues["3v3"].losses,
    },
    {
      taste: "4v4",
      games: dataValues["4v4"].wins + dataValues["4v4"].losses,
      wins: dataValues["4v4"].wins,
      losses: dataValues["4v4"].losses,
    },
  ];

  return (
    <ResponsiveRadar
      data={data}
      keys={["games", "wins", "losses"]}
      indexBy="taste"
      valueFormat=">-.0f"
      margin={{ top: 25, right: 25, bottom: 25, left: 25 }}
      borderColor={{ from: "color" }}
      gridLabelOffset={15}
      dotSize={10}
      dotColor={{ theme: "background" }}
      dotBorderWidth={2}
      colors={{ scheme: "nivo" }}
      blendMode="multiply"
      motionConfig="wobbly"
      // legends={[
      //   {
      //     anchor: 'top-left',
      //     direction: 'column',
      //     translateX: -50,
      //     translateY: -40,
      //     itemWidth: 80,
      //     itemHeight: 20,
      //     itemTextColor: '#999',
      //     symbolSize: 12,
      //     symbolShape: 'circle',
      //     effects: [
      //       {
      //         on: 'hover',
      //         style: {
      //           itemTextColor: '#000'
      //         }
      //       }
      //     ]
      //   }
      // ]}
    />
  );
};

export default GameTypesRadarChart;
