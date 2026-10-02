import { Button, Card, Group, SegmentedControl, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import React, { useMemo } from "react";
import CountryFlag, { getCountryName } from "../../../components/country-flag";
import { ProcessedCOHPlayerStats } from "../../../src/coh3/coh3-types";

// Used for players without a country, matches the fallback flag in CountryFlag
export const UNKNOWN_COUNTRY = "xx";

type CountMode = "players" | "games";

interface CountrySummary {
  country: string;
  players: number;
  games: number;
  wins: number;
  losses: number;
}

const NemesisCountriesSummary = ({
  nemesis,
  selectedCountry,
  onSelectCountry,
}: {
  nemesis: ProcessedCOHPlayerStats["nemesis"];
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
}) => {
  const { t } = useTranslation("players");
  const [mode, setMode] = React.useState<CountMode>("players");

  const countries = useMemo(() => {
    const byCountry: Record<string, CountrySummary> = {};
    for (const { c, w, l } of nemesis) {
      const country = c?.toLowerCase() || UNKNOWN_COUNTRY;
      byCountry[country] ??= { country, players: 0, games: 0, wins: 0, losses: 0 };
      byCountry[country].players++;
      byCountry[country].games += w + l;
      byCountry[country].wins += w;
      byCountry[country].losses += l;
    }
    return Object.values(byCountry);
  }, [nemesis]);

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => b[mode] - a[mode] || b.games - a.games),
    [countries, mode],
  );

  if (countries.length === 0) return null;

  return (
    <Card padding="sm" radius="md" withBorder>
      <Group justify="space-between" mb="xs" gap="xs">
        <Group gap="xs">
          <Text fw={500}>{t("nemesis.countries.title")}</Text>
          <Text size="sm" c="dimmed">
            {t("nemesis.countries.summary", {
              players: nemesis.length,
              countries: countries.length,
            })}
          </Text>
        </Group>
        <Group gap="xs">
          {selectedCountry && (
            <Button size="compact-xs" variant="subtle" onClick={() => onSelectCountry(null)}>
              {t("nemesis.countries.clearFilter")}
            </Button>
          )}
          <SegmentedControl
            size="xs"
            value={mode}
            onChange={(value) => setMode(value as CountMode)}
            data={[
              { label: t("nemesis.countries.players"), value: "players" },
              { label: t("nemesis.countries.games"), value: "games" },
            ]}
          />
        </Group>
      </Group>
      <Group gap={6}>
        {sortedCountries.map((summary) => {
          const isSelected = selectedCountry === summary.country;
          return (
            <Tooltip
              key={summary.country}
              withArrow
              label={
                <>
                  <Text size="sm" fw={500}>
                    {getCountryName(summary.country)}
                  </Text>
                  <Text size="xs">
                    {t("nemesis.countries.tooltip", {
                      players: summary.players,
                      games: summary.games,
                      wins: summary.wins,
                      losses: summary.losses,
                      winRate: ((summary.wins / (summary.games || 1)) * 100).toFixed(0),
                    })}
                  </Text>
                </>
              }
            >
              <Button
                size="compact-sm"
                radius="xl"
                variant={isSelected ? "light" : "default"}
                leftSection={
                  <CountryFlag countryCode={summary.country} size="sm" withTooltip={false} />
                }
                onClick={() => onSelectCountry(isSelected ? null : summary.country)}
                aria-pressed={isSelected}
              >
                {summary[mode]}
              </Button>
            </Tooltip>
          );
        })}
      </Group>
    </Card>
  );
};

export default NemesisCountriesSummary;
