import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { Container, Space, Title, Text, Center, Alert, Anchor } from "@mantine/core";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { IconInfoTriangle } from "@tabler/icons-react";
import Link from "next/link";
import config from "../../../../config";
import React from "react";
import { useTranslation } from "next-i18next";

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
const fromYear = "2023-01-02";
const yearDiff = 1 + dayjs(new Date()).diff(fromYear, "year");

const ActivityTab = ({
  playerStatsData,
  platform,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: string;
}) => {
  const { t } = useTranslation("players");

  if (!playerStatsData) {
    return (
      <Container size={"sm"} p={"md"}>
        <Center>
          <Alert
            icon={<IconInfoTriangle size="2rem" />}
            title={t("activity.alerts.noData.title")}
            color="yellow"
            miw={450}
          >
            {t("activity.alerts.noData.message")}
            <br />
            <br />
            {t("activity.alerts.noData.reportMessage")}{" "}
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
            title={t("activity.alerts.steamOnly.title")}
            color="yellow"
            miw={450}
          >
            {t("activity.alerts.steamOnly.message")}
            <br />
            <br />
            {t("activity.alerts.steamOnly.voteMessage")}{" "}
            <Anchor component={Link} href={config.DISCORD_INVITE_LINK} target={"_blank"}>
              Discord
            </Anchor>
            .
          </Alert>
        </Center>
      </Container>
    );

  return (
    <Container size={"lg"} pl={0} pr={0}>
      <Space h={"lg"} />
      <div style={{ height: 200 * yearDiff, paddingBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>{t("activity.charts.calendarDay.title")}</Title>
          <Text span size="sm" fs="italic">
            (GMT+00:00) UTC
          </Text>
        </div>
        <DynamicActivityByCalendarDay playerStatsData={playerStatsData} fromYear={fromYear} />
      </div>
      <Space h={"lg"} />
      <div style={{ height: 200, paddingBottom: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>{t("activity.charts.hourOfDay.title")}</Title>
          <Text span size="sm" fs="italic">
            (GMT+00:00) UTC
          </Text>
        </div>
        <DynamicActivityByHour playerStatsData={playerStatsData} />
      </div>
      <Space h={"lg"} />
      <div style={{ height: 200 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>{t("activity.charts.weekDay.title")}</Title>
        </div>
        <DynamicActivityByDayOfWeek playerStatsData={playerStatsData} />
      </div>
    </Container>
  );
};

export default ActivityTab;
