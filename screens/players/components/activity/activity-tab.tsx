import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { Container, Space, Title } from "@mantine/core";
import dynamic from "next/dynamic";

// Because of some Nivo bugs we need to render only on client side
const DynamicActivityByCalendarDay = dynamic(() => import("./activity-calendar-day"), {
  ssr: false,
});

const ActivityTab = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  console.log("playerStatsData", playerStatsData);

  if (!playerStatsData) {
    return <></>;
  }

  return (
    <Container size={"md"}>
      <Space h={"lg"} />
      <Title order={2}>Activity by calendar day</Title>
      <DynamicActivityByCalendarDay playerStatsData={playerStatsData} />
    </Container>
  );
};

export default ActivityTab;
