import React from "react";
import { Accordion, Anchor, Divider, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { getLeaderBoardRoute, getTeamLeaderboardsRoute } from "../../../src/routes";
import { raceTypeArray } from "../../../src/coh3/coh3-types";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { TFunction, useTranslation } from "next-i18next";
import FactionIcon from "../../faction-icon";

interface LeaderboardsMenuMobileProps {
  classes: Record<string, string>;
  close?: () => void;
  t: TFunction;
}

// We'll use the full faction names from localizedNames

const LeaderboardsMenuMobile: React.FC<LeaderboardsMenuMobileProps> = ({ classes, close, t }) => {
  const { t: leaderboardsT } = useTranslation("leaderboards");
  return (
    <div className={classes.hiddenDesktop}>
      <Accordion chevronPosition="right">
        <Accordion.Item value="leaderboards_menu">
          <Accordion.Control className={classes.link}>
            <Text fw="500">{t("mainMenu.leaderboards")}</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={4}>
              {/* Regular Leaderboards Section */}
              <Text fw={700} size="md">
                {t("mainMenu.regularLeaderboards", "Regular Leaderboards")}
              </Text>
              <Divider my="xs" />

              {raceTypeArray.map((faction) => (
                <Group key={faction} gap="xs">
                  <FactionIcon name={faction} width={20} />
                  <Anchor component={Link} href={getLeaderBoardRoute(faction)} onClick={close}>
                    {localizedNames[faction]}
                  </Anchor>
                </Group>
              ))}

              <Divider my="xs" />

              {/* Team Leaderboards Section */}
              <Text fw={700} size="md">
                {t("mainMenu.teamLeaderboards", "Team Leaderboards")}
              </Text>
              <Divider my="xs" />

              <Group gap="4">
                <FactionIcon name={"german"} width={20} />
                <FactionIcon name={"dak"} width={20} />
                <Anchor component={Link} href={getTeamLeaderboardsRoute("axis")} onClick={close}>
                  {leaderboardsT("teams.filters.axis", "Axis")}
                </Anchor>
              </Group>

              <Group gap="4">
                <FactionIcon name={"american"} width={20} />
                <FactionIcon name={"british"} width={20} />
                <Anchor
                  component={Link}
                  href={getTeamLeaderboardsRoute("allies")}
                  onClick={close}
                >
                  {leaderboardsT("teams.filters.allies", "Allies")}
                </Anchor>
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default LeaderboardsMenuMobile;
