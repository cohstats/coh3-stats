import { isOfficialMap, maps } from "../../src/coh3/coh3-data";
import { Text, Tooltip } from "@mantine/core";
import React from "react";
import ImageWithModal from "../image-with-modal";

const RenderMap = ({ mapName, renderTitle }: { mapName: string; renderTitle?: boolean }) => {
  renderTitle = renderTitle ?? true;

  // In case we don't track the map, eg custom maps
  if (!isOfficialMap(mapName)) {
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
      <div>
        <Tooltip label={maps[mapName].name}>
          <div>
            <ImageWithModal
              height={60}
              width={60}
              alt={mapName}
              src={maps[mapName]?.url}
              title={maps[mapName].name}
            />
          </div>
        </Tooltip>
        {renderTitle && (
          <Text align="center" style={{ whiteSpace: "nowrap" }}>
            {maps[mapName]?.name}
          </Text>
        )}
      </div>
    </>
  );
};

export default RenderMap;
