import React from "react";
import { useRouter } from "next/router";
import { Badge, Group, Paper, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import { IconTrophyFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type {
  IroncladBracketMatch,
  IroncladBracketRound,
  IroncladBracketSlot,
  IroncladPlayer,
} from "../../../src/tournaments/ironclad-tournament";
import IroncladPlayerLink from "../components/ironclad-player-link";
import { formatTournamentDate } from "../components/ironclad-badges";
import classes from "./ironclad.module.css";

const SlotRow = ({ slot, decided }: { slot: IroncladBracketSlot; decided: boolean }) => {
  const { t } = useTranslation("tournaments");

  return (
    <div className={`${classes.matchRow} ${slot.isWinner ? classes.winnerRow : ""}`}>
      {slot.player ? (
        <IroncladPlayerLink player={slot.player} fw={slot.isWinner ? 700 : 500} />
      ) : (
        // An empty slot of a decided match is a bye, it won't be filled anymore
        <Text size="sm" c="dimmed" fs="italic">
          {t(decided ? "ironclad.bracket.bye" : "ironclad.bracket.tbd")}
        </Text>
      )}
      <Text
        size="sm"
        fw={slot.isWinner ? 700 : 500}
        c={slot.score === null ? "dimmed" : undefined}
        className={classes.score}
      >
        {slot.score ?? "–"}
      </Text>
    </div>
  );
};

const MatchCard = ({ match }: { match: IroncladBracketMatch }) => {
  const { t } = useTranslation("tournaments");
  const { locale = "en" } = useRouter();
  const live = match.status === "in_progress";
  const decidedAt = formatTournamentDate(match.decidedAt, locale);

  return (
    <Paper
      withBorder
      radius="sm"
      className={`${classes.match} ${live ? classes.matchLive : ""}`}
      data-testid={`ironclad-match-${match.id}`}
    >
      <SlotRow slot={match.slots[0]} decided={match.completed} />
      <SlotRow slot={match.slots[1]} decided={match.completed} />
      <div className={classes.matchFooter}>
        <Text size="xs" c="dimmed">
          {t("ironclad.bracket.bestOf", { count: match.bestOf })}
          {decidedAt && ` · ${decidedAt}`}
        </Text>
        <Group gap={4} wrap="nowrap">
          {live && (
            <Badge size="xs" color="orange" variant="light">
              {t("ironclad.bracket.live")}
            </Badge>
          )}
          {match.forfeit && (
            <Tooltip label={t("ironclad.bracket.forfeitTooltip")} withArrow>
              <Badge
                size="xs"
                color="gray"
                variant="outline"
                data-testid="ironclad-match-forfeit"
              >
                {t("ironclad.bracket.forfeit")}
              </Badge>
            </Tooltip>
          )}
        </Group>
      </div>
    </Paper>
  );
};

const RoundColumn = ({
  title,
  isFirst,
  pairs,
  children,
}: {
  title: string;
  isFirst: boolean;
  // true when the matches are joined in pairs to the next round
  pairs: boolean;
  children: React.ReactNode[];
}) => (
  <div className={classes.round}>
    <Text
      size="xs"
      c="dimmed"
      tt="uppercase"
      fw={600}
      lts="0.06em"
      className={classes.roundTitle}
    >
      {title}
    </Text>
    <div className={`${classes.roundMatches} ${pairs ? classes.pairs : ""}`}>
      {children.map((child, index) => (
        <div className={classes.slot} key={index}>
          {!isFirst && <span className={classes.slotIn} />}
          {child}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Single elimination bracket, the rounds from the left, the champion at the end when decided.
 */
const BracketTree = ({
  rounds,
  champion,
}: {
  rounds: IroncladBracketRound[];
  champion: IroncladPlayer | null;
}) => {
  const { t } = useTranslation("tournaments");

  return (
    <ScrollArea type="auto" offsetScrollbars scrollbarSize={8} data-testid="ironclad-bracket">
      <div className={classes.bracket}>
        {rounds.map((round, index) => (
          <RoundColumn
            key={round.roundNumber}
            title={round.roundName}
            isFirst={index === 0}
            pairs={round.matches.length > 1}
          >
            {round.matches.map((match) => (
              <MatchCard match={match} key={match.id} />
            ))}
          </RoundColumn>
        ))}
        {champion && (
          <RoundColumn title={t("ironclad.champion")} isFirst={false} pairs={false}>
            {[
              <Paper
                withBorder
                radius="sm"
                p="sm"
                className={classes.championSlot}
                key="champion"
                data-testid="ironclad-bracket-champion"
              >
                <Stack gap={4} align="center">
                  <IconTrophyFilled size={22} color="var(--mantine-color-yellow-6)" />
                  <IroncladPlayerLink player={champion} size="md" fw={700} />
                </Stack>
              </Paper>,
            ]}
          </RoundColumn>
        )}
      </div>
    </ScrollArea>
  );
};

export default BracketTree;
