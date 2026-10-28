import React from "react";
import Link from "next/link";
import { Anchor, Group, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import CountryFlag from "../../../components/country-flag";
import { getPlayerCardRoute } from "../../../src/routes";
import type { IroncladPlayer } from "../../../src/tournaments/ironclad-tournament";

/**
 * Event alias of an IronClad player.
 * Players with a linked Relic profile link to our player card (with the flag when we know it),
 * the rest is plain text with a small link to the IronClad profile.
 */
const IroncladPlayerLink = ({
  player,
  size = "sm",
  fw = 600,
}: {
  player: IroncladPlayer;
  size?: "xs" | "sm" | "md";
  fw?: number;
}) => {
  const { t } = useTranslation("tournaments");
  // The current Relic alias, when it differs from the one used for the event
  const title = player.alias && player.alias !== player.eventAlias ? player.alias : undefined;

  return (
    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }} data-testid="ironclad-player">
      {player.country && <CountryFlag countryCode={player.country} size="sm" />}
      {player.relicId !== null ? (
        <Anchor
          component={Link}
          href={getPlayerCardRoute(player.relicId)}
          size={size}
          fw={fw}
          truncate="end"
          title={title}
        >
          {player.eventAlias}
        </Anchor>
      ) : (
        <>
          <Text size={size} fw={fw} truncate="end">
            {player.eventAlias}
          </Text>
          {player.profileUrl && (
            <Anchor
              href={player.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
              aria-label={t("ironclad.participants.ironcladProfile")}
              title={t("ironclad.participants.ironcladProfile")}
              style={{ display: "inline-flex", flexShrink: 0 }}
            >
              <IconExternalLink size={12} />
            </Anchor>
          )}
        </>
      )}
    </Group>
  );
};

export default IroncladPlayerLink;
