import { Button, Card, Group, SegmentedControl, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import React, { useMemo } from "react";
import CountryFlag, { getCountryName } from "../../../components/country-flag";
import {
  NemesisCountMode,
  NemesisRecord,
  summarizeNemesisCountries,
} from "../../../src/players/nemesis";

const NemesisCountriesSummary = ({
  nemesis,
  selectedCountry,
  onSelectCountry,
}: {
  nemesis: NemesisRecord[];
  selectedCountry: string | null;
  onSelectCountry: (country: string | null) => void;
}) => {
  const { t } = useTranslation("players");
  const [mode, setMode] = React.useState<NemesisCountMode>("players");

  const countries = useMemo(() => summarizeNemesisCountries(nemesis, mode), [nemesis, mode]);

  if (countries.length === 0) return null;

  return (
    <Card padding="sm" radius="md" withBorder data-testid="nemesis-countries-summary">
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
            <Button
              size="compact-xs"
              variant="subtle"
              onClick={() => onSelectCountry(null)}
              data-testid="nemesis-countries-clear-filter"
            >
              {t("nemesis.countries.clearFilter")}
            </Button>
          )}
          <SegmentedControl
            size="xs"
            value={mode}
            onChange={(value) => setMode(value as NemesisCountMode)}
            data={[
              { label: t("nemesis.countries.players"), value: "players" },
              { label: t("nemesis.countries.games"), value: "games" },
            ]}
          />
        </Group>
      </Group>
      <Group gap={6}>
        {countries.map((summary) => {
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
                data-testid="nemesis-country-chip"
                data-country={summary.country}
              >
                {summary[mode]}
              </Button>
            </Tooltip>
          );
        })}
      </Group>
      <Text size="xs" c="dimmed" mt="xs">
        {t("nemesis.countries.hint")}
      </Text>
    </Card>
  );
};

export default NemesisCountriesSummary;
