import { Badge, Card, Group, Image, Stack, Text } from "@mantine/core";
import React from "react";
import Link from "next/link";
import { TFunction } from "next-i18next/pages";
import { getExplorerMapRoute } from "../../../src/routes";
import {
  getMpMapImageUrl,
  MpMapMode,
  stripMpMapNamePrefix,
} from "../../../src/explorer/mp-maps-helpers";
import styles from "./map-card.module.css";

const IMAGE_SIZE = 90;

/** Only the fields the search result card needs - see `generate-search-data.ts`. */
export interface MapSearchData {
  id: string;
  name: string;
  mode: MpMapMode;
  maxPlayers: number;
  isCommunity: boolean;
}

interface MapCardProps {
  map: MapSearchData;
  t: TFunction;
}

export const MapCard = ({ map, t }: MapCardProps) => {
  const name = stripMpMapNamePrefix(map.name);

  return (
    <Link href={getExplorerMapRoute(map.id)} style={{ textDecoration: "none" }}>
      <Card shadow="sm" padding="xs" radius="md" withBorder w={300} className={styles.mapCard}>
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <Image
            src={getMpMapImageUrl(map.id)}
            alt={name}
            w={IMAGE_SIZE}
            h={IMAGE_SIZE}
            fit="contain"
            loading="lazy"
            className={styles.minimap}
            fallbackSrc={`https://placehold.co/${IMAGE_SIZE}x${IMAGE_SIZE}?text=${encodeURIComponent(
              name,
            )}`}
          />
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text
              fw={500}
              size="md"
              lineClamp={2}
              title={name}
              style={{ whiteSpace: name.length > 20 ? "normal" : "nowrap" }}
            >
              {name}
            </Text>
            <Group gap={6}>
              <Badge variant="light" color="blue" size="sm">
                {t(`search:mapCard.modes.${map.mode}`)}
              </Badge>
              <Badge variant="light" color="gray" size="sm">
                {t("search:mapCard.players", { count: map.maxPlayers })}
              </Badge>
              {map.isCommunity && (
                <Badge variant="light" color="teal" size="sm">
                  {t("search:mapCard.community")}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>
      </Card>
    </Link>
  );
};
