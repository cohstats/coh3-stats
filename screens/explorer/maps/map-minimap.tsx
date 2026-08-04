import React, { useEffect, useRef, useState } from "react";
import { Box, Group, Image, Stack, Text, Tooltip } from "@mantine/core";
import { TFunction } from "next-i18next/pages";
import MapPointIcon from "./map-point-icon";
import {
  formatMpMapIncome,
  getMpMapImageUrl,
  getMpMapLargeImageUrl,
  getMpMapPlainImageUrl,
  MP_MAP_POINT_KINDS,
  MpMapPointMarker,
  MpMapRenderedPointKind,
} from "../../../src/explorer/mp-maps-helpers";
import type { MpMapSize } from "../../../src/explorer/mp-maps-types";
import classes from "./map-minimap.module.css";

/**
 * Size of the icons in the legend under the minimap. The markers on the map itself have no size here
 * - they scale with the width of the map, see `--point-icon-size` in the stylesheet.
 */
const LEGEND_ICON_SIZE = 22;

const PointTooltipLabel = ({ marker, t }: { marker: MpMapPointMarker; t: TFunction }) => {
  if (marker.kind === "starting_position") {
    return (
      <Text size="xs">
        {marker.team === null
          ? t("detail.playerPositionTooltip", { position: marker.teamPosition ?? 1 })
          : t("detail.startingPositionTooltip", {
              team: marker.team + 1,
              position: marker.teamPosition ?? 1,
            })}
      </Text>
    );
  }

  return (
    <Stack gap={0}>
      <Text size="xs" fw={700}>
        {t(`points.${marker.kind}Single`)}
        {marker.tier && marker.tier !== "default" ? ` (${t(`tiers.${marker.tier}`)})` : ""}
      </Text>
      {marker.income !== null && (
        <Text size="xs">
          {t("detail.pointIncome", { value: formatMpMapIncome(marker.income) })}
        </Text>
      )}
      <Text size="xs">{t("detail.pointCaptureTime", { value: marker.captureTime })}</Text>
      <Text size="xs">{t("detail.pointRevertTime", { value: marker.revertTime })}</Text>
      {marker.secureRadius > 0 && (
        <Text size="xs">{t("detail.pointSecureRadius", { value: marker.secureRadius })}</Text>
      )}
    </Stack>
  );
};

/** A single point drawn on top of the minimap. */
const PointMarker = ({ marker, t }: { marker: MpMapPointMarker; t: TFunction }) => {
  const kindClass =
    marker.kind === "starting_position"
      ? classes.markerStart
      : marker.kind === "victory"
        ? classes.markerVictory
        : undefined;

  return (
    <Tooltip label={<PointTooltipLabel marker={marker} t={t} />} withArrow position="top">
      <Box
        className={`${classes.marker} ${kindClass ?? ""}`}
        style={{
          left: `${marker.left * 100}%`,
          top: `${marker.top * 100}%`,
          // Tier of the point, folded into the marker size by the stylesheet.
          "--point-icon-scale": marker.sizeScale,
        }}
      >
        <MapPointIcon
          kind={marker.kind}
          team={marker.team}
          position={marker.teamPosition}
          alt={t(`points.${marker.kind}Single`)}
        />
        {marker.income !== null && (
          <Text component="span" className={classes.markerLabel}>
            +{formatMpMapIncome(marker.income)}
          </Text>
        )}
      </Box>
    </Tooltip>
  );
};

/** Legend entry - the icon of a kind, its name and how many of them the map has. */
const LegendEntry = ({
  kind,
  count,
  t,
}: {
  kind: MpMapRenderedPointKind;
  count: number;
  t: TFunction;
}) => {
  return (
    <Group gap={6} wrap="nowrap">
      {/* The legend stands for every player start, so it shows a generic `1` of the first team. */}
      <MapPointIcon kind={kind} size={LEGEND_ICON_SIZE} position={1} />
      <Text size="sm">
        {t(`points.${kind}`)}: <strong>{count}</strong>
      </Text>
    </Group>
  );
};

/**
 * The minimap of a map with all its points drawn on top of it.
 *
 * The backdrop is the bare minimap, because the `marked` variants on the CDN have the point icons
 * baked in and those would double up with ours. The bare one is missing for a couple of maps though,
 * so there are two fallbacks:
 *  - the marked minimap, but only when the map has no point we would draw an icon for anyway (Final
 *    Stand maps have nothing but player starts), so nothing can end up drawn twice;
 *  - the styled background of the wrapper, with just the markers on top of it.
 */
const MapMinimap = ({
  mapId,
  mapName,
  mapSize,
  markers,
  t,
}: {
  mapId: string;
  mapName: string;
  mapSize: MpMapSize;
  markers: MpMapPointMarker[];
  t: TFunction;
}) => {
  // Which backdrop we are currently showing - we walk down the list as the images fail to load.
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  const counts = MP_MAP_POINT_KINDS.map(
    (kind) => [kind, markers.filter((marker) => marker.kind === kind).length] as const,
  ).filter(([, count]) => count > 0);

  // Only safe to fall back to the marked minimap when we draw no icon which is already on it.
  const canUseMarkedImage = markers.every((marker) => marker.kind === "starting_position");
  const sources = [
    // Best first: the 800px render, then the 400px one, which a few more maps have.
    getMpMapLargeImageUrl(mapId),
    getMpMapPlainImageUrl(mapId),
    ...(canUseMarkedImage ? [getMpMapImageUrl(mapId)] : []),
  ];
  const source = sources[sourceIndex];

  // The page is statically generated, so on a map without a minimap the image has already failed by
  // the time React hydrates and the `onError` below never fires. Catch that case on mount - a loaded
  // image always has a natural width, a broken one doesn't.
  useEffect(() => {
    setSourceIndex(0);
  }, [mapId]);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setSourceIndex((index) => index + 1);
  }, [source]);

  return (
    <Stack gap="xs">
      <Box
        className={classes.wrapper}
        style={{ aspectRatio: `${mapSize.width} / ${mapSize.height}` }}
        data-testid={`map-minimap-${mapId}`}
      >
        {source && (
          <Image
            // Keyed by the source so that a failed image is replaced rather than patched, otherwise
            // the browser keeps the broken state of the previous src around.
            key={source}
            ref={imageRef}
            src={source}
            alt={mapName}
            className={classes.image}
            onError={() => setSourceIndex((index) => index + 1)}
          />
        )}
        {markers.map((marker) => (
          <PointMarker key={marker.key} marker={marker} t={t} />
        ))}
      </Box>

      {counts.length > 0 && (
        <Group gap="md">
          {counts.map(([kind, count]) => (
            <LegendEntry key={kind} kind={kind} count={count} t={t} />
          ))}
        </Group>
      )}

      <Stack gap={2}>
        <Text size="sm" c="dimmed">
          {t("detail.hoverHint")}
        </Text>
        <Text size="sm" c="dimmed" component="ul" className={classes.hintList}>
          {["tier", "income", "captureTime", "revertTime", "secureRadius"].map((key) => (
            <li key={key}>{t(`detail.hoverDetails.${key}`)}</li>
          ))}
        </Text>
        <Text size="sm" c="dimmed">
          {t("detail.tierSizeHint")}
        </Text>
      </Stack>
    </Stack>
  );
};

export default MapMinimap;
