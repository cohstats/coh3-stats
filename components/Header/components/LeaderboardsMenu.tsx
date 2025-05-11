import {
  leaderBoardType,
  leaderBoardTypeArray,
  raceTypeArray,
} from "../../../src/coh3/coh3-types";
import { Anchor, Divider, Group, Image, SimpleGrid, Text, Stack } from "@mantine/core";
import Link from "next/link";
import { getLeaderBoardRoute, getTeamLeaderboardsRoute } from "../../../src/routes";
import { localizedNames } from "../../../src/coh3/coh3-data";
import React from "react";
import { getIconsPathOnCDN } from "../../../src/utils";

const addPlayerIcons = (type: leaderBoardType) => {
  return Array.from({ length: parseInt(type[0]) }, () => (
    <Image
      key={Math.random()}
      width={20}
      height={20}
      fit="contain"
      src={getIconsPathOnCDN("/icons/races/common/symbols/building_barracks.webp")}
      alt=""
      fallbackSrc={"https://placehold.co/20x20?text=X"}
    />
  ));
};

const LeaderboardsMenu = () => {
  return (
    <Stack>
      <SimpleGrid cols={4} spacing={0}>
        {leaderBoardTypeArray.map((type) => {
          return (
            <div key={type}>
              <Group>
                <Text fw={700}>{type.replace("v", " vs ")}</Text>
                <Group gap={0}>{addPlayerIcons(type)}</Group>
              </Group>
              <Divider my="sm" />
              {raceTypeArray.map((faction) => {
                return (
                  <Text key={`${faction}_${type}`}>
                    <Anchor component={Link} href={getLeaderBoardRoute(faction, type)}>
                      {localizedNames[faction]}
                    </Anchor>
                  </Text>
                );
              })}
            </div>
          );
        })}
      </SimpleGrid>

      <Divider my="sm" />

      <Text fw={700} size="lg">
        Team Leaderboards
      </Text>
      <SimpleGrid cols={3} spacing={0}>
        {["2v2", "3v3", "4v4"].map((type) => {
          return (
            <div key={`team_${type}`}>
              <Group>
                <Text fw={700}>{type.replace("v", " vs ")}</Text>
                <Group gap={0}>{addPlayerIcons(type as leaderBoardType)}</Group>
              </Group>
              <Divider my="sm" />
              <Text>
                <Anchor
                  component={Link}
                  href={getTeamLeaderboardsRoute("axis", type as leaderBoardType)}
                >
                  Axis Teams
                </Anchor>
              </Text>
              <Text>
                <Anchor
                  component={Link}
                  href={getTeamLeaderboardsRoute("allies", type as leaderBoardType)}
                >
                  Allies Teams
                </Anchor>
              </Text>
            </div>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};

export default LeaderboardsMenu;
