import { Group, Text, Avatar, Card, Anchor } from "@mantine/core";
import { SearchPlayerCardData } from "../../src/coh3/coh3-types";
import React from "react";
import LinkWithOutPrefetch from "../LinkWithOutPrefetch";
import { getPlayerCardRoute } from "../../src/routes";
import CountryFlag from "../country-flag";

export const SearchPlayerCard: React.FC<{ data: SearchPlayerCardData }> = ({ data }) => {
  return (
    <>
      <Anchor
        component={LinkWithOutPrefetch}
        href={getPlayerCardRoute(data.relicProfileId)}
        style={{ textDecoration: "none" }}
      >
        <Card p={4} pl={5} w={300} withBorder>
          <Group>
            <Avatar
              src={data.avatar}
              imageProps={{ loading: "lazy" }}
              alt={data.alias}
              size={40}
            />
            <div>
              <Group>
                <CountryFlag countryCode={data.country} />
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
