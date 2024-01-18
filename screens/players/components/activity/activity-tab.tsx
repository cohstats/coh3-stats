import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { Container, Space, Title, Text, Center, Alert, Anchor } from "@mantine/core";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { IconInfoTriangle } from "@tabler/icons-react";
import Link from "next/link";
import config from "../../../../config";
import React from "react";

// Because of some Nivo bugs we need to render only on client side
const DynamicActivityByCalendarDay = dynamic(() => import("./activity-calendar-day"), {
  ssr: false,
});

const DynamicActivityByHour = dynamic(() => import("./activity-hour"), {
  ssr: false,
});

const DynamicActivityByDayOfWeek = dynamic(() => import("./activity-week-day"), {
  ssr: false,
});

// From year is used to calculate the height of the calendar
const fromYear = "2023-01-01";
const yearDiff = 1 + dayjs(new Date()).diff(fromYear, "year");

const ActivityTab = ({
  playerStatsData,
  platform,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: string;
}) => {
  if (!playerStatsData) {
    return (
      <Container size={"sm"} p={"md"}>
        <Center>
          <Alert
            icon={<IconInfoTriangle size="2rem" />}
            title={"No Activity Data"}
            color="yellow"
            miw={450}
          >
            It looks like we are not getting activity data for this player.
            <br />
            <br />
            If this error persists, please report it on{" "}
            <Anchor component={Link} href={config.DISCORD_INVITE_LINK} target={"_blank"}>
              Discord
            </Anchor>
            .
          </Alert>
        </Center>
      </Container>
    );
  }

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
    <Container size={"lg"}>
      <Space h={"lg"} />
      <div style={{ height: 200 * yearDiff, paddingBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>Activity by calendar day</Title>
          <Text size="sm" fs="italic">
            (GMT+00:00) UTC
          </Text>
        </div>
        <DynamicActivityByCalendarDay playerStatsData={playerStatsData} fromYear={fromYear} />
      </div>
      <Space h={"lg"} />
      <div style={{ height: 200 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>Activity by hour of day</Title>
          <Text size="sm" fs="italic">
            (GMT+00:00) UTC
          </Text>
        </div>
        <DynamicActivityByHour playerStatsData={playerStatsData} />
      </div>
      <Space h={"lg"} />
      <div style={{ height: 200 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>Activity by week day</Title>
        </div>
        <DynamicActivityByDayOfWeek playerStatsData={playerStatsData} />
      </div>
    </Container>
  );
};

export default ActivityTab;
