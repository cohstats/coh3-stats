import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import {
  Container,
  Space,
  Title,
  Text,
  Center,
  Alert,
  Anchor,
  Select,
  Group,
} from "@mantine/core";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { IconInfoTriangle } from "@tabler/icons-react";
import Link from "next/link";
import config from "../../../../config";
import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import HelperIcon from "../../../../components/icon/helper";
import { isBrowserEnv } from "../../../../src/utils";

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

/**
 * Get the browser's timezone offset in hours
 * @returns {number} Timezone offset in hours (e.g., -7 for PDT, 1 for CET)
 */
const getBrowserTimezoneOffset = (): number => {
  if (!isBrowserEnv()) return 0;

  // Get timezone offset in minutes and convert to hours
  const offsetInMinutes = new Date().getTimezoneOffset();
  // Note: getTimezoneOffset returns the difference between UTC and local time in minutes
  // It returns negative values for timezones east of UTC and positive for west of UTC
  // We need to invert the sign to match our GMT+/- format
  const offset = -offsetInMinutes / 60;
  // Round to the nearest integer for full hour timezones only
  return Math.round(offset);
};

const ActivityTab = ({
  playerStatsData,
  platform,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: string;
}) => {
  const { t } = useTranslation("players");
  const [selectedTimezone, setSelectedTimezone] = useState<number>(0);

  // Set the default timezone based on the browser's timezone on component mount
  useEffect(() => {
    const browserTimezone = getBrowserTimezoneOffset();
    setSelectedTimezone(browserTimezone);
  }, []);

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingRight: 30,
          }}
        >
          <Title order={2}>{t("activity.charts.hourOfDay.title")}</Title>
          <Group gap="xs">
            <HelperIcon text={t("activity.timezoneHelper")} iconSize={22} />
            <Select
              size="xs"
              placeholder={t("activity.filters.timezone")}
              value={selectedTimezone.toString()}
              w={140}
              onChange={(value) => setSelectedTimezone(Number(value))}
              data={[
                { value: "-12", label: "GMT-12:00" },
                { value: "-11", label: "GMT-11:00" },
                { value: "-10", label: "GMT-10:00" },
                { value: "-9", label: "GMT-09:00" },
                { value: "-8", label: "GMT-08:00" },
                { value: "-7", label: "GMT-07:00" },
                { value: "-6", label: "GMT-06:00" },
                { value: "-5", label: "GMT-05:00" },
                { value: "-4", label: "GMT-04:00" },
                { value: "-3", label: "GMT-03:00" },
                { value: "-2", label: "GMT-02:00" },
                { value: "-1", label: "GMT-01:00" },
                { value: "0", label: "GMT+00:00 (UTC)" },
                { value: "1", label: "GMT+01:00" },
                { value: "2", label: "GMT+02:00" },
                { value: "3", label: "GMT+03:00" },
                { value: "4", label: "GMT+04:00" },
                { value: "5", label: "GMT+05:00" },
                { value: "6", label: "GMT+06:00" },
                { value: "7", label: "GMT+07:00" },
                { value: "8", label: "GMT+08:00" },
                { value: "9", label: "GMT+09:00" },
                { value: "10", label: "GMT+10:00" },
                { value: "11", label: "GMT+11:00" },
                { value: "12", label: "GMT+12:00" },
                { value: "13", label: "GMT+13:00" },
                { value: "14", label: "GMT+14:00" },
              ]}
              allowDeselect={false}
              withCheckIcon={false}
            />
          </Group>
        </div>
        <DynamicActivityByHour
          playerStatsData={playerStatsData}
          timezoneOffset={selectedTimezone}
        />
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
