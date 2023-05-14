import { Group, Image, Text, Avatar, Card, Anchor } from "@mantine/core";
import { SearchPlayerCardData } from "../../src/coh3/coh3-types";
import React from "react";
import LinkWithOutPrefetch from "../LinkWithOutPrefetch";
import { getPlayerCardRoute } from "../../src/routes";

export const SearchPlayerCard: React.FC<{ data: SearchPlayerCardData }> = ({ data }) => {
  return (
    <>
      <Anchor
        component={LinkWithOutPrefetch}
        href={getPlayerCardRoute(data.relicProfileId)}
        style={{ textDecoration: "none" }}
      >
        <Card p={4} pl={5} w={300}>
          <Group>
            <Avatar
              src={data.avatar}
              imageProps={{ loading: "lazy" }}
              alt={data.alias}
              size={40}
            />
            <div>
              <Group>
                <Image
                  src={"/flags/4x3/" + data.country + ".svg"}
                  imageProps={{ loading: "lazy" }}
                  alt={data.country}
                  width={20}
                />
                <Text> {data.alias}</Text>
              </Group>
              <Text size="xs" color="dimmed">
                XP: {data.level}
              </Text>
            </div>
          </Group>
        </Card>
      </Anchor>
    </>
  );
};
