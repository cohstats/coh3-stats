import {
  platformType,
  PlayerCardDataType,
  ProcessedCOHPlayerStats,
} from "../../../src/coh3/coh3-types";
import { DataTable } from "mantine-datatable";
import {
  Anchor,
  Card,
  Container,
  List,
  Space,
  Title,
  Text,
  Group,
  Avatar,
  Stack,
  Flex,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import Link from "next/link";
import EllipsisText from "../../../components/other/ellipsis-text";
import React, { useMemo } from "react";
import {
  getPlayerCardInfo,
  triggerPlayerNemesisAliasesUpdate,
} from "../../../src/apis/coh3stats-api";
import { processPlayerInfoAPIResponse } from "../../../src/players/standings";
import CountryFlag from "../../../components/country-flag";

import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getPlayerCardRoute } from "../../../src/routes";
import { IconInfoTriangle } from "@tabler/icons-react";
import config from "../../../config";

interface IndividualNemesis {
  diff: number;
  player: {
    w: number;
    l: number;
    alias: string;
    profile_id: string;
  } | null;
}

const findStompers = (playerStatsData: ProcessedCOHPlayerStats | undefined) => {
  const data = playerStatsData?.nemesis || [];

  const topStomper: IndividualNemesis = {
    diff: 0,
    player: null,
  };

  const topVictim: IndividualNemesis = {
    diff: 0,
    player: null,
  };

  for (const player of data) {
    const diff = player.w - player.l;
    if (diff < topStomper.diff) {
      topStomper.diff = diff;
      topStomper.player = player;
    }
    if (diff > topVictim.diff) {
      topVictim.diff = diff;
      topVictim.player = player;
    }
  }

  return {
    topStomper,
    topVictim,
  };
};

const StomperCard = ({
  stomper,
}: {
  stomper:
    | {
        data: IndividualNemesis;
        apiData: PlayerCardDataType;
      }
    | null
    | undefined;
}) => {
  if (!stomper) {
    return (
      <>
        <Center>
          <Text span c={"dimmed"}>
            {" "}
            No 1v1 Nemesis
          </Text>
        </Center>
      </>
    );
  }

  const wins = stomper.data.player?.w || 0;
  const losses = stomper.data.player?.l || 0;
  const winRate = ((wins / (wins + losses)) * 100).toFixed(0) + "%";

  return (
    <>
      <Anchor
        component={LinkWithOutPrefetch}
        href={getPlayerCardRoute(stomper.apiData.info.relicID || "")}
        style={{ textDecoration: "none" }}
      >
        <Card p="0">
          <Flex justify={"space-between"}>
            <Group>
              <Avatar
                src={stomper.apiData.steamData?.avatarmedium}
                imageProps={{ loading: "lazy" }}
                alt={stomper.apiData.info.name}
                size={50}
                radius="xs"
              />
              <Flex justify="flex-start" align="flex-start" direction="column" wrap="wrap">
                <Group gap={"xs"}>
                  <CountryFlag countryCode={stomper.apiData.info.country || ""} />
                  <Text span fz="xl">
                    {" "}
                    {stomper.apiData.info.name}
                  </Text>
                </Group>

                <Text span size="sm" color="dimmed">
                  <Group gap={"xs"}>
                    <span>Wins: {wins}</span>
                    <span>Losses: {losses} </span>
                  </Group>
                </Text>
              </Flex>
            </Group>
            <div>
              <Text span fz="xl">
                <Group>
                  <div>
                    {stomper.data.diff > 0 && (
                      <span style={{ color: "green" }}> +{stomper.data.diff}</span>
                    )}
                    {stomper.data.diff < 0 && (
                      <span style={{ color: "red" }}> {stomper.data.diff}</span>
                    )}
                  </div>
                  <div>{winRate}</div>
                </Group>
              </Text>
            </div>
          </Flex>
        </Card>
      </Anchor>
    </>
  );
};

const NemesisTab = ({
  playerStatsData,
  platform,
  profileID,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: platformType;
  profileID: string;
}) => {
  const data = playerStatsData?.nemesis || [];

  const [stomperData, setStomperData] = React.useState<{
    topStomper: {
      data: IndividualNemesis;
      apiData: PlayerCardDataType;
    } | null;
    topVictim: {
      data: IndividualNemesis;
      apiData: PlayerCardDataType;
    } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(data.length !== 0);

  const stompers = useMemo(() => {
    return findStompers(playerStatsData);
  }, [playerStatsData]);

  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setStomperData(null);
      try {
        let PromiseTopStomperData;
        let PromiseTopVictimData;

        if (stompers.topStomper.player?.profile_id) {
          PromiseTopStomperData = getPlayerCardInfo(
            stompers.topStomper.player?.profile_id,
            true,
            "",
          );
        }

        if (stompers.topVictim.player?.profile_id) {
          PromiseTopVictimData = getPlayerCardInfo(
            stompers.topVictim.player?.profile_id,
            true,
            "",
          );
        }

        const [topStomperData, topVictimData] = await Promise.all([
          PromiseTopStomperData,
          PromiseTopVictimData,
        ]);
        setStomperData({
          topStomper: topStomperData
            ? {
                data: stompers.topStomper,
                apiData: processPlayerInfoAPIResponse(topStomperData),
              }
            : null,
          topVictim: topVictimData
            ? {
                data: stompers.topVictim,
                apiData: processPlayerInfoAPIResponse(topVictimData),
              }
            : null,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [stompers]);

  React.useEffect(() => {
    (async () => {
      triggerPlayerNemesisAliasesUpdate(profileID).then().catch(console.error);
    })();
  }, [profileID]);

  if (platform !== "steam")
    return (
      <Container size={"sm"} p={"md"}>
        <Center>
          <Alert
            icon={<IconInfoTriangle size="2rem" />}
            title={"No COH3 Stats Data"}
            color="yellow"
            miw={450}
          >
            These stats are available only for Steam players.
            <br />
            <br />
            If you would like to have these stats on Consoles too, please vote / report it on our{" "}
            <Anchor component={Link} href={config.DISCORD_INVITE_LINK} target={"_blank"}>
              Discord
            </Anchor>
            .
          </Alert>
        </Center>
      </Container>
    );

  return (
    <>
      <Container size={"md"}>
        <Space h={"lg"} />
        <Title order={2}>1v1 Nemesis</Title>
        <Flex wrap={"wrap"}>
          <Card m={"xs"} padding="sm" radius="md" ml={0} withBorder style={{ flexGrow: 1 }}>
            <List size="sm">
              <List.Item>Nemesis counter has be to 'triggered'</List.Item>
              <List.Item>
                Trigger by playing with the same player 2 times in 1 day (UTC).
              </List.Item>
              <List.Item>Aliases are saved from the last game played with that player</List.Item>
              <List.Item>
                After the trigger, all 1v1 games with that player are counted.
              </List.Item>
              <List.Item>Data are updated once a day 6 AM UTC.</List.Item>

              <List.Item>Only Steam players are tracked.</List.Item>
            </List>
          </Card>
          <Stack gap={0}>
            <Card
              m={"xs"}
              padding="xs"
              radius="md"
              mr={0}
              withBorder
              style={{ overflow: "visible", minWidth: 370, minHeight: 115 }}
            >
              <Card.Section>
                <Group m={"xs"} gap={"xs"}>
                  <Title order={4}>Top Nemesis -</Title>
                  {stomperData?.topStomper?.data.player?.alias}*
                </Group>
              </Card.Section>
              {isLoading && (
                <Center mx="auto">
                  <Loader />
                </Center>
              )}
              {!isLoading && <StomperCard stomper={stomperData?.topStomper} />}
            </Card>
            <Card
              m={"xs"}
              padding="sm"
              radius="md"
              withBorder
              mr={0}
              style={{ overflow: "visible", minWidth: 370, minHeight: 115 }}
            >
              <Card.Section>
                <Group m="xs" gap={"xs"}>
                  <Title order={4}>Top Victim -</Title>
                  {stomperData?.topVictim?.data.player?.alias}*
                </Group>
              </Card.Section>
              {isLoading && (
                <Center mx="auto">
                  <Loader />
                </Center>
              )}
              {!isLoading && <StomperCard stomper={stomperData?.topVictim} />}
            </Card>
          </Stack>
        </Flex>
        <Space h={"lg"} />
        <DataTable
          minHeight={450}
          records={data}
          noRecordsText="No 1v1 nemesis tracked"
          withTableBorder={true}
          borderRadius="md"
          striped={true}
          verticalSpacing={4}
          // @ts-ignore
          columns={[
            {
              accessor: "alias",
              textAlign: "left",
              title: "Alias",
              width: "100%",
              render: ({ alias, profile_id, c }) => {
                return (
                  <Anchor
                    key={profile_id}
                    component={LinkWithOutPrefetch}
                    href={getPlayerCardRoute(profile_id)}
                  >
                    <Group gap="xs">
                      <CountryFlag countryCode={c} />
                      <EllipsisText text={alias} />
                    </Group>
                  </Anchor>
                );
              },
            },
            {
              accessor: "w",
              textAlign: "center",
              title: "Wins",
            },
            {
              accessor: "l",
              textAlign: "center",
              title: "Losses",
            },
            {
              accessor: "diff",
              textAlign: "center",
              title: "Diff",
              render: ({ w, l }) => {
                const diff = w - l;
                const color = diff > 0 ? "green" : "red";
                const sign = diff > 0 ? "+" : "";
                return <span style={{ color }}>{`${sign}${diff}`}</span>;
              },
            },
            {
              accessor: "wl",
              textAlign: "center",
              title: "Ratio",
              render: ({ w, l }) => {
                const winrate = (w / (w + l)) * 100;
                return winrate.toFixed(0) + "%";
              },
            },
            {
              accessor: "total",
              textAlign: "center",
              title: "Total",
              render: ({ w, l }) => {
                return w + l;
              },
            },
          ]}
          idAccessor={"profile_id"}
        />
      </Container>
    </>
  );
};

export default NemesisTab;
