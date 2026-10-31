import React from "react";
import dayjs from "dayjs";
import { Badge, BadgeProps } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";

const TOURNAMENT_STATUS_COLORS: Record<string, string> = {
  upcoming: "blue",
  registration_open: "green",
  in_progress: "orange",
  completed: "gray",
};

const DIVISION_STATE_COLORS: Record<string, string> = {
  filling: "blue",
  // Full, waiting for the bracket
  ready: "teal",
  in_progress: "orange",
  completed: "gray",
};

/**
 * Color of the division state, the unknown states are blue like the filling divisions.
 */
export const getDivisionStateColor = (state: string) =>
  Object.prototype.hasOwnProperty.call(DIVISION_STATE_COLORS, state)
    ? DIVISION_STATE_COLORS[state]
    : "blue";

/**
 * Formats an API date (ISO 8601 in UTC), eg "10 Oct 2026".
 * Only the UTC date part is used, so the SSR and the client output are the same (no hydration mismatch).
 */
export const formatTournamentDate = (isoDate: string | null, locale: string) => {
  if (!isoDate) return "";
  const date = dayjs(isoDate.slice(0, 10));
  if (!date.isValid()) return "";
  return date.locale(locale).format("D MMM YYYY");
};

export const TournamentStatusBadge = ({
  status,
  ...props
}: { status: string } & Omit<BadgeProps, "children" | "color">) => {
  const { t } = useTranslation("tournaments");
  const known = status in TOURNAMENT_STATUS_COLORS;

  return (
    <Badge
      color={TOURNAMENT_STATUS_COLORS[status] ?? "gray"}
      variant="light"
      data-testid="ironclad-tournament-status"
      {...props}
    >
      {t(`ironclad.status.${known ? status : "unknown"}`)}
    </Badge>
  );
};

export const RegistrationBadge = ({
  open,
  ...props
}: { open: boolean } & Omit<BadgeProps, "children" | "color">) => {
  const { t } = useTranslation("tournaments");

  return (
    <Badge
      color={open ? "green" : "gray"}
      variant={open ? "filled" : "outline"}
      data-testid="ironclad-registration"
      {...props}
    >
      {t(open ? "ironclad.registrationOpen" : "ironclad.registrationClosed")}
    </Badge>
  );
};

export const DivisionStateBadge = ({
  state,
  ...props
}: { state: string } & Omit<BadgeProps, "children" | "color">) => {
  const { t } = useTranslation("tournaments");
  const known = state in DIVISION_STATE_COLORS;

  return (
    <Badge
      color={DIVISION_STATE_COLORS[state] ?? "gray"}
      variant="light"
      size="sm"
      data-testid="ironclad-division-state"
      {...props}
    >
      {t(`ironclad.divisionState.${known ? state : "unknown"}`)}
    </Badge>
  );
};
