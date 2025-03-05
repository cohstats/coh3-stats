import { Group, Text, Avatar, Card, Anchor, Stack } from "@mantine/core";
import { SearchPlayerCardData } from "../../../src/coh3/coh3-types";
import React from "react";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getPlayerCardRoute } from "../../../src/routes";
import CountryFlag from "../../../components/country-flag";
import { format } from "timeago.js";
import EllipsisText from "../../../components/other/ellipsis-text";
import { Steam } from "../../../components/icon/steam";
import { PSNIcon } from "../../../components/icon/psn";
import { XboxIcon } from "../../../components/icon/xbox";
import styles from "./search-player-card.module.css";

export const SearchPlayerCard: React.FC<{ data: SearchPlayerCardData }> = ({ data }) => {
  return (
    <>
      <Anchor
        component={LinkWithOutPrefetch}
        href={getPlayerCardRoute(data.relicProfileId)}
        style={{ textDecoration: "none" }}
      >
        <Card p={4} pl={5} w={300} withBorder className={styles.playerCard}>
          <Group gap={"xs"}>
            <Avatar
              src={data.avatar}
              imageProps={{ loading: "lazy" }}
              alt={data.alias}
              size={40}
              radius="sm"
            />
            <Stack gap={0} style={{ flex: 1 }}>
              <Group justify="space-between" w="100%">
                <Group gap={"xs"}>
                  <CountryFlag countryCode={data.country} />
                  <EllipsisText text={data.alias} maxWidth="17ch" />
                </Group>
                <Group>
                  {data.platform === "steam" && (
                    <Steam label="Steam Profile" mode="svg" size={20} />
                  )}
                  {data.platform === "psn" && (
                    <PSNIcon mode="svg" size={20} label="Play Station player" />
                  )}
                  {data.platform === "xbox" && (
                    <XboxIcon mode="svg" size={20} label="XBOX player" />
                  )}
                </Group>
              </Group>
              <Group justify="flex-start" w="100%">
                {data.lastActiveUnixTs && (
                  <Text size="xs" c="dimmed">
                    Last active {format(data.lastActiveUnixTs * 1000)}
                  </Text>
                )}
              </Group>
            </Stack>
          </Group>
        </Card>
      </Anchor>
    </>
  );
};
