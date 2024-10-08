import { Text, Tooltip } from "@mantine/core";
import React from "react";
import ImageWithModal from "../../../../../components/image-with-modal";
import { getIconsPathOnCDN } from "../../../../../src/utils";
import { isOfficialMap, maps } from "../../../../../src/coh3/coh3-data";

const RenderMap = ({ mapName, renderTitle }: { mapName: string; renderTitle?: boolean }) => {
  renderTitle = renderTitle ?? true;

  // In case we don't track the map, eg custom maps
  if (!isOfficialMap(mapName)) {
    return (
      <div>
        <Text style={{ whiteSpace: "nowrap", textAlign: "center" }}>{mapName}</Text>
      </div>
    );
  }

  return (
    <>
      <div style={{ width: "100%" }}>
        <Tooltip label={maps[mapName].name}>
          <div>
            <ImageWithModal
              height={60}
              width={60}
              alt={mapName}
              src={getIconsPathOnCDN(maps[mapName]?.url, "maps")}
              title={maps[mapName].name}
            />
          </div>
        </Tooltip>
        {renderTitle && (
          <Text style={{ whiteSpace: "nowrap", textAlign: "center" }}>{maps[mapName]?.name}</Text>
        )}
      </div>
    </>
  );
};

export default RenderMap;
