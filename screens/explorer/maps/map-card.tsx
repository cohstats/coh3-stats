import React from "react";
import { Badge, Card, Group, Image, Stack, Text, Tooltip } from "@mantine/core";
import { IconRulerMeasure } from "@tabler/icons-react";
import { TFunction } from "next-i18next/pages";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getExplorerMapRoute } from "../../../src/routes";
import { getIconsPathOnCDN } from "../../../src/utils";
import { getMpMapImageUrl, MpMapListItem } from "../../../src/explorer/mp-maps-helpers";
import classes from "./map-card.module.css";

/** Side of the (square) minimap thumbnail on the left of the card. */
const IMAGE_SIZE = 170;

/** Size of the resource / map size icons in the stats row. */
const STAT_ICON_SIZE = 22;

/** A single value in the stats row of the card - a resource point count or the map size. */
const CardStat = ({
  value,
  label,
  icon,
}: {
  value: React.ReactNode;
  label: string;
  icon: React.ReactNode;
}) => (
  <Tooltip label={label}>
    <Group gap={4} wrap="nowrap">
      {icon}
      <Text size="sm" fw={500}>
        {value}
      </Text>
    </Group>
  </Tooltip>
);

const ResourceIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    w={STAT_ICON_SIZE}
    h={STAT_ICON_SIZE}
    fit="contain"
    src={getIconsPathOnCDN(src)}
    alt={alt}
  />
);

const MapCard = ({ map, t }: { map: MpMapListItem; t: TFunction }) => {
  const { pointCounts, mapSize } = map;

  return (
    <Card
      component={LinkWithOutPrefetch}
      href={getExplorerMapRoute(map.id)}
      p={0}
      radius="md"
      withBorder
      style={{ height: "100%" }}
      data-testid={`map-card-${map.id}`}
    >
      <Group gap="md" wrap="nowrap" align="flex-start" style={{ height: "100%" }}>
        <Image
          src={getMpMapImageUrl(map.id)}
          alt={map.name}
          w={IMAGE_SIZE}
          h={IMAGE_SIZE}
          fit="contain"
          // Most of the cards are below the fold, no point in fetching ~65 minimaps upfront.
          loading="lazy"
          className={classes.minimap}
          style={{ flex: `0 0 ${IMAGE_SIZE}px` }}
          fallbackSrc={`https://placehold.co/${IMAGE_SIZE}x${IMAGE_SIZE}?text=${encodeURIComponent(
            map.name,
          )}`}
        />

        {/* minWidth 0 so that the long map names can be clamped instead of stretching the card. */}
        <Stack gap={8} py="sm" pr="sm" style={{ minWidth: 0, flex: 1 }}>
          <Text fz="h4" fw={700} lineClamp={2} title={map.name}>
            {map.name}
          </Text>

          <Group gap={6}>
            <Badge variant="light" color="blue">
              {t(`modes.${map.mode}`)}
            </Badge>
            <Badge variant="light" color="gray">
              {t("card.players", { count: map.maxPlayers })}
            </Badge>
            {map.isCommunity &&
              (map.author ? (
                <Tooltip label={t("card.authorTooltip", { author: map.author })}>
                  <Badge variant="light" color="teal">
                    {t("card.community")}
                  </Badge>
                </Tooltip>
              ) : (
                <Badge variant="light" color="teal">
                  {t("card.community")}
                </Badge>
              ))}
            {!map.isLobbyVisible && (
              <Tooltip label={t("card.notInLobbyTooltip")}>
                <Badge variant="light" color="red">
                  {t("card.notInLobby")}
                </Badge>
              </Tooltip>
            )}
          </Group>

          <Group gap="md">
            {!!pointCounts.victory && (
              <CardStat
                value={pointCounts.victory}
                label={t("points.victory")}
                icon={
                  <ResourceIcon
                    src="/icons/common/resources/symbols/mm_victory_point.png"
                    alt={t("points.victory")}
                  />
                }
              />
            )}
            {!!pointCounts.fuel && (
              <CardStat
                value={pointCounts.fuel}
                label={t("points.fuel")}
                icon={
                  <ResourceIcon
                    src="/icons/common/resources/resource_fuel.png"
                    alt={t("points.fuel")}
                  />
                }
              />
            )}
            {!!pointCounts.munitions && (
              <CardStat
                value={pointCounts.munitions}
                label={t("points.munitions")}
                icon={
                  <ResourceIcon
                    src="/icons/common/resources/resource_munition.png"
                    alt={t("points.munitions")}
                  />
                }
              />
            )}
            {/* `strategic` is what the data file calls them, in game those are manpower points. */}
            {!!pointCounts.strategic && (
              <CardStat
                value={pointCounts.strategic}
                label={t("points.strategic")}
                icon={
                  <ResourceIcon
                    src="/icons/common/resources/resource_manpower.png"
                    alt={t("points.strategic")}
                  />
                }
              />
            )}
          </Group>

          <CardStat
            value={t("card.mapSize", { width: mapSize.width, height: mapSize.height })}
            label={t("card.mapSizeTooltip")}
            icon={<IconRulerMeasure size={STAT_ICON_SIZE} />}
          />
        </Stack>
      </Group>
    </Card>
  );
};

export default MapCard;
