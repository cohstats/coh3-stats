import {
  leaderBoardType,
  leaderBoardTypeArray,
  raceTypeArray,
} from "../../../src/coh3/coh3-types";
import { Anchor, Divider, Group, Image, SimpleGrid, Text } from "@mantine/core";
import Link from "next/link";
import { getLeaderBoardRoute } from "../../../src/routes";
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
      withPlaceholder
    />
  ));
};

const LeaderboardsMenu = () => {
  return (
    <SimpleGrid cols={4} spacing={0}>
      {leaderBoardTypeArray.map((type) => {
        return (
          <div key={type}>
            <Group>
              <Text weight={700}>{type.replace("v", " vs ")}</Text>
              <Group spacing={0}>{addPlayerIcons(type)}</Group>
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
  );
};

export default LeaderboardsMenu;
