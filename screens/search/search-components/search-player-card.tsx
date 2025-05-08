import { Group, Text, Avatar, Card, Anchor, Stack } from "@mantine/core";
import { SearchPlayerCardData } from "../../../src/coh3/coh3-types";
import React from "react";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getPlayerCardRoute } from "../../../src/routes";
import CountryFlag from "../../../components/country-flag";
import EllipsisText from "../../../components/other/ellipsis-text";
import { Steam } from "../../../components/icon/steam";
import { PSNIcon } from "../../../components/icon/psn";
import { XboxIcon } from "../../../components/icon/xbox";
import styles from "./search-player-card.module.css";
import InternalTimeAgo from "../../../components/internal-timeago";
import { TFunction } from "next-i18next";

interface SearchPlayerCardProps {
  data: SearchPlayerCardData;
  t: TFunction;
}

export const SearchPlayerCard: React.FC<SearchPlayerCardProps> = ({ data, t }) => {
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
                    <Steam label={t("search:playerCard.steamProfile")} mode="svg" size={20} />
                  )}
                  {data.platform === "psn" && (
                    <PSNIcon mode="svg" size={20} label={t("search:playerCard.psnPlayer")} />
                  )}
                  {data.platform === "xbox" && (
                    <XboxIcon mode="svg" size={20} label={t("search:playerCard.xboxPlayer")} />
                  )}
                </Group>
              </Group>
              {data.lastActiveUnixTs && (
                <Group justify="flex-start" w="100%" gap={4}>
                  <Text size="xs" c="dimmed">
                    {t("search:playerCard.lastActive")}
                  </Text>
                  <Text size="xs" c="dimmed">
                    <InternalTimeAgo timestamp={data.lastActiveUnixTs} />
                  </Text>
                </Group>
              )}
            </Stack>
          </Group>
        </Card>
      </Anchor>
    </>
  );
};
