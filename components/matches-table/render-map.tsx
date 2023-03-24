import { maps } from "../../src/coh3/coh3-data";
import { Text } from "@mantine/core";
import React from "react";
import ImageWithModal from "../image-with-modal";

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
    <>
      <div style={{ cursor: "pointer" }}>
        <ImageWithModal
          height={60}
          width={60}
          alt={mapName}
          src={maps[mapName]?.url}
          modalW={400}
          modalH={400}
          title={maps[mapName].name}
        />
        <Text align="center" style={{ whiteSpace: "nowrap" }}>
          {maps[mapName]?.name}
        </Text>
      </div>
    </>
  );
};

export default RenderMap;
