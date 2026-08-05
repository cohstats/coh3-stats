import { Anchor, Text, Tooltip } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { getIconsPathOnCDN } from "../../../../../src/utils";
import { isOfficialMap, maps } from "../../../../../src/coh3/coh3-data";
import { getExplorerMapRoute } from "../../../../../src/routes";

const RenderMap = ({
  mapName,
  renderTitle,
  height,
  width,
}: {
  mapName: string;
  renderTitle?: boolean;
  height?: number;
  width?: number;
}) => {
  renderTitle = renderTitle ?? true;

  // In case we don't track the map, eg custom maps
  if (!isOfficialMap(mapName)) {
    return (
      <div>
        <Text style={{ whiteSpace: "nowrap", textAlign: "center" }} size={"sm"}>
          {mapName}
        </Text>
      </div>
    );
  }

  const imageHeight = height ?? 60;
  const imageWidth = width ?? 60;
  const mapRoute = getExplorerMapRoute(mapName);

  return (
    <>
      <div style={{ width: "100%" }}>
        <Tooltip label={maps[mapName].name}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Link href={mapRoute}>
              <Image
                style={{
                  cursor: "pointer",
                  objectFit: "contain",
                  maxHeight: `${imageWidth}px`,
                  maxWidth: `${imageHeight}px`,
                }}
                height={imageHeight}
                width={imageWidth}
                alt={mapName}
                src={getIconsPathOnCDN(maps[mapName]?.url, "maps")}
                loading="lazy"
              />
            </Link>
          </div>
        </Tooltip>
        {renderTitle && (
          <Text style={{ whiteSpace: "nowrap", textAlign: "center" }} size={"sm"}>
            <Anchor component={Link} href={mapRoute} inherit c={"inherit"} underline={"hover"}>
              {maps[mapName]?.name}
            </Anchor>
          </Text>
        )}
      </div>
    </>
  );
};

export default RenderMap;
