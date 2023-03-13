import { leaderBoardTypeArray, raceTypeArray } from "../../../src/coh3/coh3-types";
import { Anchor, Divider, SimpleGrid, Text } from "@mantine/core";
import Link from "next/link";
import { getLeaderBoardRoute } from "../../../src/routes";
import { localizedNames } from "../../../src/coh3/coh3-data";
import React from "react";

const LeaderboardsMenu = () => {
  return (
    <SimpleGrid cols={4} spacing={0}>
      {leaderBoardTypeArray.map((type) => {
        return (
          <div key={type}>
            <Text weight={700}>{type.replace("v", " vs ")}</Text>
            <Divider my="sm" />
            {raceTypeArray.map((faction) => {
              return (
                <Text key={type}>
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
