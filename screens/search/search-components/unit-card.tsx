import { Card, Group, Text } from "@mantine/core";
import React from "react";
import ImageWithFallback, {
  iconPlaceholder,
  symbolPlaceholder,
} from "../../../components/placeholders";
import FactionIcon from "../../../components/faction-icon";
import { raceType } from "../../../src/coh3/coh3-types";
import { getExplorerUnitRoute } from "../../../src/routes";
import Link from "next/link";

export interface UnitData {
  id: string;
  icon: string;
  name: string;
  faction: string;
  symbol: string;
}

interface UnitCardProps {
  unit: UnitData;
}

export const UnitCard = ({ unit }: UnitCardProps) => (
  <Link
    href={getExplorerUnitRoute(unit.faction as raceType, unit.id)}
    style={{ textDecoration: "none" }}
  >
    <Card
      shadow="sm"
      padding="xs"
      radius="md"
      withBorder
      style={{ cursor: "pointer", position: "relative" }}
      w={300}
    >
      <ImageWithFallback
        src={`/icons/${unit.symbol}`}
        fallbackSrc={symbolPlaceholder}
        alt={`${unit.name} symbol`}
        width={24}
        height={24}
        style={{ position: "absolute", top: 8, right: 8 }}
      />
      <Group gap="xs" align="flex-start" wrap="nowrap">
        <Group gap="2" align="flex-start" wrap="nowrap">
          <FactionIcon name={unit.faction as raceType} width={44} />
          <ImageWithFallback
            src={`/icons/${unit.icon}`}
            fallbackSrc={iconPlaceholder}
            alt={unit.name}
            width={48}
            height={48}
          />
        </Group>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
          <Text
            fw={500}
            size="md"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: unit.name.length > 20 ? "normal" : "nowrap",
            }}
          >
            {unit.name}
          </Text>
        </div>
      </Group>
    </Card>
  </Link>
);
