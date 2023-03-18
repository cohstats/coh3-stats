import { maps } from "../../src/coh3/coh3-data";
import { Text } from "@mantine/core";
import Image from "next/image";
import React from "react";

const RenderMap = ({ mapName }: { mapName: string }) => {
  // In case we don't track the map, eg custom maps
  if (!maps[mapName]) {
    return (
      <div>
        <Text align="center" style={{ whiteSpace: "nowrap" }}>
          {mapName}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Image src={maps[mapName]?.url} width={60} height={60} alt={mapName} loading="lazy" />
      <Text align="center" style={{ whiteSpace: "nowrap" }}>
        {maps[mapName]?.name}
      </Text>
    </div>
  );
};

export default RenderMap;
