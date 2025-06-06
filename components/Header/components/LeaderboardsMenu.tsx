import {
  leaderBoardType,
  leaderBoardTypeArray,
  raceType,
  raceTypeArray,
} from "../../../src/coh3/coh3-types";
import { Anchor, Divider, Group, SimpleGrid, Text, Stack } from "@mantine/core";
import Link from "next/link";
import { getLeaderBoardRoute, getTeamLeaderboardsRoute } from "../../../src/routes";
import React from "react";
import FactionIcon from "../../../components/faction-icon";
import { TFunction } from "next-i18next";

// Shorter faction names for the menu
const shortFactionNames: Record<raceType, string> = {
  german: "Wehr",
  american: "USF",
  dak: "DAK",
  british: "British",
};

interface LeaderboardsMenuProps {
  t: TFunction;
}

const LeaderboardsMenu: React.FC<LeaderboardsMenuProps> = ({ t }) => {
  return (
    <Stack>
      <SimpleGrid cols={4} spacing={0}>
        {raceTypeArray.map((faction) => {
          return (
            <div key={faction}>
              <Group gap={"xs"} justify="center">
                <FactionIcon name={faction} width={24} />
                <Text fw={700}>{shortFactionNames[faction]}</Text>
              </Group>
              <Divider my="xs" />
              {leaderBoardTypeArray.map((type) => {
                return (
                  <Anchor
                    key={`${faction}_${type}`}
                    component={Link}
                    href={getLeaderBoardRoute(faction, type)}
                    style={{ display: "block", textAlign: "center" }}
                  >
                    <Group gap="xs" justify="center">
                      <Text>{type.replace("v", " vs ")}</Text>
                      {/* <Group gap={0} ml={-5}>{addPlayerIcons(type)}</Group> */}
                    </Group>
                  </Anchor>
                );
              })}
            </div>
          );
        })}
      </SimpleGrid>

      <Divider m={0} />

      <Text fw={700} size="lg" ta="center">
        {t("mainMenu.teamLeaderboards", "Team Leaderboards")}
      </Text>
      <SimpleGrid cols={2} spacing={0}>
        <div>
          <Group justify="center" gap={4}>
            <FactionIcon name={"german"} width={22} />
            <FactionIcon name={"dak"} width={22} />
            <Text fw={700} size={"lg"}>
              {" "}
              {t("leaderboards:teams.filters.axis", "Axis")}
            </Text>
          </Group>
          <Divider my="xs" />
          {["2v2", "3v3", "4v4"].map((type) => (
            <Anchor
              key={`axis_${type}`}
              component={Link}
              href={getTeamLeaderboardsRoute("axis", type as leaderBoardType)}
              style={{ display: "block", textAlign: "center" }}
            >
              <Group gap="xs" justify="center">
                <Text>{type.replace("v", " vs ")}</Text>
                {/* <Group gap={0} ml={-5}>{addPlayerIcons(type as leaderBoardType)}</Group> */}
              </Group>
            </Anchor>
          ))}
        </div>
        <div>
          <Group justify="center" gap={4}>
            <FactionIcon name={"american"} width={22} />
            <FactionIcon name={"british"} width={22} />
            <Text fw={700} size={"lg"}>
              {t("leaderboards:teams.filters.allies", "Allies")}
            </Text>
          </Group>
          <Divider my="xs" />
          {["2v2", "3v3", "4v4"].map((type) => (
            <Anchor
              key={`allies_${type}`}
              component={Link}
              href={getTeamLeaderboardsRoute("allies", type as leaderBoardType)}
              style={{ display: "block", textAlign: "center" }}
            >
              <Group gap="xs" justify="center">
                <Text>{type.replace("v", " vs ")}</Text>
                {/* <Group gap={0} ml={-5}>{addPlayerIcons(type as leaderBoardType)}</Group> */}
              </Group>
            </Anchor>
          ))}
        </div>
      </SimpleGrid>
    </Stack>
  );
};

export default LeaderboardsMenu;
