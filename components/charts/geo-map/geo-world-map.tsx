import React from "react";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoMapFeatures } from "./geo-map-features";
import { stateNamesByCode } from "./states";
import { Group, useMantineColorScheme } from "@mantine/core";
import { getNivoTooltipTheme } from "../charts-components-utils";
import { DataTable } from "mantine-datatable";
import CountryFlag from "../../country-flag";

interface GeoWorldMapProps {
  data: Array<{ id: string; value: number }>;
}

const columns = [
  {
    accessor: "name",
    title: "Country",
    width: "100%",
    render: ({ name, key }: { name: string; key: string }) => {
      return (
        <>
          <Group gap="xs">
            <CountryFlag countryCode={key} size={"xs"} />
            {name}
          </Group>
        </>
      );
    },
  },
  {
    accessor: "value",
    title: "Players",
    textAlign: "right",
    render: ({ value }: { value: number }) => {
      return value.toLocaleString();
    },
  },
];

const GeoWorldMap: React.FC<GeoWorldMapProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();

  // Remove empty states
  data = data.filter((d) => d.value > 0);

  // Add name to the data
  data = data.map((d) => {
    return {
      ...d,
      ...{
        // @ts-ignore
        name: stateNamesByCode[d.id.toUpperCase()],
        key: d.id.toUpperCase(),
        id: d.id.toUpperCase(),
      },
    };
  });

  // Sort is by biggest
  data = data.sort((a, b) => {
    if (a.value < b.value) {
      return 1;
    }
    if (a.value > b.value) {
      return -1;
    }
    return 0;
  });

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 650, height: 420, marginRight: 20 }}>
          <ResponsiveChoropleth
            data={data}
            features={geoMapFeatures.features}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            colors={[
              "E4EEF9",
              "D7E5F6",
              "CADDF3",
              "BCD4F0",
              "AFCCED",
              "A2C3EA",
              "94BBE7",
              "87B2E4",
              "7AAAE1",
              "6DA1DE",
              "5F99DB",
              "5290D8",
              "4588D5",
              "377FD2",
              "2A77CF",
              "1D6ECC",
              "0F66C9",
            ].map((c) => `#${c}`)}
            domain={[0, data[1].value]}
            unknownColor="#FFFFFF"
            label="properties.name"
            valueFormat=".2s"
            projectionTranslation={[0.5, 0.7]}
            projectionRotation={[0, 0, 0]}
            enableGraticule={false}
            graticuleLineColor="#dddddd"
            borderWidth={0.5}
            borderColor="#152538"
            theme={getNivoTooltipTheme(colorScheme)}
            // legends={[
            //     {
            //       anchor: 'bottom-left',
            //       direction: 'column',
            //       justify: true,
            //       translateX: 20,
            //       translateY: -100,
            //       itemsSpacing: 0,
            //       itemWidth: 94,
            //       itemHeight: 18,
            //       itemDirection: 'left-to-right',
            //       itemTextColor: '#444444',
            //       itemOpacity: 0.85,
            //       symbolSize: 18,
            //       effects: [
            //         {
            //           on: 'hover',
            //           style: {
            //             itemTextColor: '#000000',
            //             itemOpacity: 1
            //           }
            //         }
            //       ]
            //     }
            //     ]}
          />
        </div>
        <div style={{ flex: "1", maxWidth: 270 }}>
          <DataTable
            // @ts-ignore
            columns={columns}
            records={data.slice(0, 10)}
            idAccessor={"key"}
          />
        </div>
      </div>
    </div>
  );
};

export default GeoWorldMap;
