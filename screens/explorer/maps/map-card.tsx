import React from "react";
import { Badge, Card, Group, Image, Stack, Text, Tooltip } from "@mantine/core";
import { IconFlag3Filled, IconMapPinFilled } from "@tabler/icons-react";
import { TFunction } from "next-i18next/pages";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getExplorerMapRoute } from "../../../src/routes";
import { getIconsPathOnCDN } from "../../../src/utils";
import { getMpMapImageUrl, MpMapListItem } from "../../../src/explorer/mp-maps-helpers";

/**
 * Resource points we show on the card. The game has no exported icon for victory / strategic
 * points, so those use a generic icon.
 */
const PointCountBadge = ({
  count,
  label,
  icon,
}: {
  count: number;
  label: string;
  icon: React.ReactNode;
}) => (
  <Tooltip label={label}>
    <Group gap={3} wrap="nowrap">
      {icon}
      <Text size="sm" fw={500}>
        {count}
      </Text>
    </Group>
  </Tooltip>
);

const ResourceIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Image w={16} h={16} fit="contain" src={getIconsPathOnCDN(src)} alt={alt} />
);

const MapCard = ({ map, t }: { map: MpMapListItem; t: TFunction }) => {
  const { pointCounts } = map;

  const modeLabel = map.mode === "hoff" ? t("modes.hoff") : t(`modes.${map.mode}`);

  return (
    <Card
      component={LinkWithOutPrefetch}
      href={getExplorerMapRoute(map.id)}
      p="sm"
      radius="md"
      withBorder
      style={{ height: "100%" }}
      data-testid={`map-card-${map.id}`}
    >
      <Card.Section>
        <Image
          src={getMpMapImageUrl(map.id)}
          alt={map.name}
          h={190}
          fit="contain"
          bg="dark.8"
          fallbackSrc={`https://placehold.co/400x190?text=${encodeURIComponent(map.name)}`}
        />
      </Card.Section>

      <Stack gap={6} mt="sm">
        <Text fw={600} lineClamp={1} title={map.name}>
          {map.name}
        </Text>

        <Group gap={6}>
          <Badge variant="light" color="blue">
            {modeLabel}
          </Badge>
          <Badge variant="light" color="gray">
            {t("card.players", { count: map.maxPlayers })}
          </Badge>
          {map.isCommunity && (
            <Tooltip label={map.author ? t("card.authorTooltip", { author: map.author }) : ""}>
              <Badge variant="light" color="teal">
                {t("card.community")}
              </Badge>
            </Tooltip>
          )}
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
            <PointCountBadge
              count={pointCounts.victory}
              label={t("points.victory")}
              icon={<IconFlag3Filled size={16} />}
            />
          )}
          {!!pointCounts.fuel && (
            <PointCountBadge
              count={pointCounts.fuel}
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
            <PointCountBadge
              count={pointCounts.munitions}
              label={t("points.munitions")}
              icon={
                <ResourceIcon
                  src="/icons/common/resources/resource_munition.png"
                  alt={t("points.munitions")}
                />
              }
            />
          )}
          {!!pointCounts.strategic && (
            <PointCountBadge
              count={pointCounts.strategic}
              label={t("points.strategic")}
              icon={<IconMapPinFilled size={16} />}
            />
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default MapCard;
