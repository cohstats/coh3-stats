import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { Container, Space, Title, Text } from "@mantine/core";
import dynamic from "next/dynamic";

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

const ActivityTab = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  if (!playerStatsData) {
    return <></>;
  }

  return (
    <Container size={"lg"}>
      <Space h={"lg"} />
      <div style={{ minHeight: 200 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>Activity by calendar day</Title>
          <Text size="sm" fs="italic">
            (GMT+00:00) UTC
          </Text>
        </div>
        <DynamicActivityByCalendarDay playerStatsData={playerStatsData} />
      </div>
      <Space h={"lg"} />
      <div style={{ minHeight: 245 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>Activity by hour of day</Title>
          <Text size="sm" fs="italic">
            (GMT+00:00) UTC
          </Text>
        </div>
        <DynamicActivityByHour playerStatsData={playerStatsData} />
      </div>
      <div style={{ minHeight: 245 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Title order={2}>Activity by week day</Title>
        </div>
        <DynamicActivityByDayOfWeek playerStatsData={playerStatsData} />
      </div>
    </Container>
  );
};

export default ActivityTab;
