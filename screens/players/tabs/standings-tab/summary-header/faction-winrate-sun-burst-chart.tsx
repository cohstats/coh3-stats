import { ResponsiveSunburst } from "@nivo/sunburst";
import { InternalStandings, raceType } from "../../../../../src/coh3/coh3-types";
import { chartDataObjectsForTimeSeries } from "../../../../../components/charts/charts-components-utils";

const FactionWinRateSunBurstChart = ({
  playerStandings,
}: {
  playerStandings: InternalStandings;
}) => {
  const dataValues: Record<
    raceType,
    {
      wins: number;
      losses: number;
    }
  > = {
    german: {
      wins: 0,
      losses: 0,
    },
    dak: {
      wins: 0,
      losses: 0,
    },
    british: {
      wins: 0,
      losses: 0,
    },
    american: {
      wins: 0,
      losses: 0,
    },
  };

  for (const [faction, dataObject] of Object.entries(playerStandings)) {
    Object.values(dataObject).forEach((gameType) => {
      if (gameType) {
        dataValues[faction as raceType].wins += gameType.wins;
        dataValues[faction as raceType].losses += gameType.losses;
      }
    });
  }

  const chartData = {
    name: "winRate",
    children: [
      {
        name: "german",
        color: chartDataObjectsForTimeSeries.german.color,
        children: [
          {
            name: "wins",
            color: "#60BD68",
            value: dataValues.german.wins,
          },
          {
            name: "losses",
            color: "#F15854",
            value: dataValues.german.losses,
          },
        ],
      },
      {
        name: "dak",
        color: chartDataObjectsForTimeSeries.dak.color,
        children: [
          {
            name: "wins",
            color: "#60BD68",
            value: dataValues.dak.wins,
          },
          {
            name: "losses",
            color: "#F15854",
            value: dataValues.dak.losses,
          },
        ],
      },
      {
        name: "british",
        color: chartDataObjectsForTimeSeries.british.color,
        children: [
          {
            name: "wins",
            color: "#60BD68",
            value: dataValues.british.wins,
          },
          {
            name: "losses",
            color: "#F15854",
            value: dataValues.british.losses,
          },
        ],
      },
      {
        name: "american",
        color: chartDataObjectsForTimeSeries.american.color,
        children: [
          {
            name: "wins",
            color: "#60BD68",
            value: dataValues.american.wins,
          },
          {
            name: "losses",
            color: "#F15854",
            value: dataValues.american.losses,
          },
        ],
      },
    ],
  };

  return (
    <ResponsiveSunburst
      data={chartData}
      margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
      id="name"
      value="value"
      // key="name"
      cornerRadius={1}
      borderColor={{ theme: "background" }}
      borderWidth={2}
      // @ts-ignore
      colors={(d) => d.data.color}
      childColor={(parent, child) => {
        // @ts-ignore
        return child.data.color;
      }}
      // childColor={{
      //   from: 'color',
      //   modifiers: [
      //     [
      //       'brighter',
      //       0.2
      //     ]
      //   ]
      // }}
      // enableArcLabels={true}
      arcLabelsSkipAngle={10}
      arcLabelsRadiusOffset={2}
      // arcLabelsTextColor={{
      //   from: 'color',
      //   modifiers: [
      //     [
      //       'darker',
      //       1.4
      //     ]
      //   ]
      // }}

      arcLabel={(e) => {
        return `${e.data.name} - ${e.percentage.toFixed(0)}%`;
      }}
      animate={false}
      // motionConfig="gentle"
      // onClick={function noRefCheck(){}}
      // transitionMode="pushIn"
    />
  );
};

export default FactionWinRateSunBurstChart;
