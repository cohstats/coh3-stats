import React from "react";
import Link from "next/link";
import { Anchor, Group } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import CountryFlag from "../../../components/country-flag";
import { getPlayerCardRoute } from "../../../src/routes";

/**
 * Flag + name of a Ladder Tournament player linking to the player card.
 * Players we couldn't look up on Relic are shown as "Player #<relicId>" without a flag.
 */
const LadderPlayerLink = ({
  relicId,
  alias,
  country,
}: {
  relicId: number;
  alias: string | null;
  country: string | null;
}) => {
  const { t } = useTranslation("tournaments");

  return (
    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
      {country && <CountryFlag countryCode={country} size="sm" />}
      <Anchor
        component={Link}
        href={getPlayerCardRoute(relicId)}
        size="sm"
        fw={600}
        truncate="end"
      >
        {alias ?? t("league.playerFallback", { id: relicId })}
      </Anchor>
    </Group>
  );
};

export default LadderPlayerLink;
