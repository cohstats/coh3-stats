import React from "react";
import { ResponsiveLine } from "@nivo/line";

const exampleDAta = [
  {
    id: "japan",
    color: "hsl(284, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 12,
      },
      {
        x: "helicopter",
        y: 219,
      },
      {
        x: "boat",
        y: 90,
      },
      {
        x: "train",
        y: 290,
      },
      {
        x: "subway",
        y: 174,
      },
      {
        x: "bus",
        y: 246,
      },
      {
        x: "car",
        y: 111,
      },
      {
        x: "moto",
        y: 16,
      },
      {
        x: "bicycle",
        y: 148,
      },
      {
        x: "horse",
        y: 96,
      },
      {
        x: "skateboard",
        y: 295,
      },
      {
        x: "others",
        y: 209,
      },
    ],
  },
  {
    id: "france",
    color: "hsl(71, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 165,
      },
      {
        x: "helicopter",
        y: 62,
      },
      {
        x: "boat",
        y: 144,
      },
      {
        x: "train",
        y: 138,
      },
      {
        x: "subway",
        y: 120,
      },
      {
        x: "bus",
        y: 28,
      },
      {
        x: "car",
        y: 238,
      },
      {
        x: "moto",
        y: 142,
      },
      {
        x: "bicycle",
        y: 44,
      },
      {
        x: "horse",
        y: 209,
      },
      {
        x: "skateboard",
        y: 260,
      },
      {
        x: "others",
        y: 229,
      },
    ],
  },
  {
    id: "us",
    color: "hsl(206, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 47,
      },
      {
        x: "helicopter",
        y: 0,
      },
      {
        x: "boat",
        y: 174,
      },
      {
        x: "train",
        y: 125,
      },
      {
        x: "subway",
        y: 131,
      },
      {
        x: "bus",
        y: 89,
      },
      {
        x: "car",
        y: 97,
      },
      {
        x: "moto",
        y: 122,
      },
      {
        x: "bicycle",
        y: 4,
      },
      {
        x: "horse",
        y: 74,
      },
      {
        x: "skateboard",
        y: 244,
      },
      {
        x: "others",
        y: 70,
      },
    ],
  },
  {
    id: "germany",
    color: "hsl(218, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 287,
      },
      {
        x: "helicopter",
        y: 223,
      },
      {
        x: "boat",
        y: 92,
      },
      {
        x: "train",
        y: 103,
      },
      {
        x: "subway",
        y: 208,
      },
      {
        x: "bus",
        y: 300,
      },
      {
        x: "car",
        y: 122,
      },
      {
        x: "moto",
        y: 5,
      },
      {
        x: "bicycle",
        y: 83,
      },
      {
        x: "horse",
        y: 11,
      },
      {
        x: "skateboard",
        y: 222,
      },
      {
        x: "others",
        y: 213,
      },
    ],
  },
  {
    id: "norway",
    color: "hsl(157, 70%, 50%)",
    data: [
      {
        x: "plane",
        y: 140,
      },
      {
        x: "helicopter",
        y: 26,
      },
      {
        x: "boat",
        y: 14,
      },
      {
        x: "train",
        y: 92,
      },
      {
        x: "subway",
        y: 93,
      },
      {
        x: "bus",
        y: 178,
      },
      {
        x: "car",
        y: 206,
      },
      {
        x: "moto",
        y: 76,
      },
      {
        x: "bicycle",
        y: 90,
      },
      {
        x: "horse",
        y: 13,
      },
      {
        x: "skateboard",
        y: 194,
      },
      {
        x: "others",
        y: 260,
      },
    ],
  },
];

const PlayersLineChart = ({ data }: { data: Array<any> }) => {
  console.log(data);

  const chartData = [
    {
      id: "players",
      data: data,
    },
  ];

  let maxValue = 0;
  let minValue = Infinity;

  for (let i = 0; i < data.length; i++) {
    if (data[i].y > maxValue) {
      maxValue = data[i].y;
    }
    if (data[i].y < minValue) {
      minValue = data[i].y;
    }
  }

  console.log(chartData);

  return (
    <div style={{ width: 600, height: 350 }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{
          format: "%Y-%m-%d",
          precision: "day",
          type: "time",
          useUTC: false,
        }}
        yScale={{
          type: "linear",
          min: minValue - (maxValue - minValue) * 0.2,
          max: maxValue + (maxValue - minValue) * 0.2,
        }}
        // yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          format: "%b %d",
          // legend: 'time scale',
          // legendOffset: -12,
          tickValues: "every 2 days",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Ranked players active",
          legendOffset: -45,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableGridX={false}
        enableCrosshair={false}
      />
    </div>
  );
};

export default PlayersLineChart;
