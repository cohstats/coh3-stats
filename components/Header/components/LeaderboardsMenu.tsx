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

// Shorter faction names for the menu
const shortFactionNames: Record<raceType, string> = {
  german: "Wehr",
  american: "USF",
  dak: "DAK",
  british: "British",
};

const LeaderboardsMenu = () => {
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
              <Divider my="sm" />
              {leaderBoardTypeArray.map((type) => {
                return (
                  <Text key={`${faction}_${type}`} ta="center">
                    <Anchor component={Link} href={getLeaderBoardRoute(faction, type)}>
                      <Group gap="xs" justify="center">
                        <Text>{type.replace("v", " vs ")}</Text>
                        {/* <Group gap={0} ml={-5}>{addPlayerIcons(type)}</Group> */}
                      </Group>
                    </Anchor>
                  </Text>
                );
              })}
            </div>
          );
        })}
      </SimpleGrid>

      <Divider my="sm" />

      <Text fw={700} size="lg" ta="center">
        Team Leaderboards
      </Text>
      <SimpleGrid cols={2} spacing={0}>
        <div>
          <Group justify="center">
            <Text fw={700}>Axis</Text>
          </Group>
          <Divider my="sm" />
          {["2v2", "3v3", "4v4"].map((type) => (
            <Text key={`axis_${type}`} ta="center">
              <Anchor
                component={Link}
                href={getTeamLeaderboardsRoute("axis", type as leaderBoardType)}
              >
                <Group gap="xs" justify="center">
                  <Text>{type.replace("v", " vs ")}</Text>
                  {/* <Group gap={0} ml={-5}>{addPlayerIcons(type as leaderBoardType)}</Group> */}
                </Group>
              </Anchor>
            </Text>
          ))}
        </div>
        <div>
          <Group justify="center">
            <Text fw={700}>Allies</Text>
          </Group>
          <Divider my="sm" />
          {["2v2", "3v3", "4v4"].map((type) => (
            <Text key={`allies_${type}`} ta="center">
              <Anchor
                component={Link}
                href={getTeamLeaderboardsRoute("allies", type as leaderBoardType)}
              >
                <Group gap="xs" justify="center">
                  <Text>{type.replace("v", " vs ")}</Text>
                  {/* <Group gap={0} ml={-5}>{addPlayerIcons(type as leaderBoardType)}</Group> */}
                </Group>
              </Anchor>
            </Text>
          ))}
        </div>
      </SimpleGrid>
    </Stack>
  );
};

export default LeaderboardsMenu;
