import { LiveGameSummary } from "../../src/coh3/coh3-types";
import { Card, Divider, Group, Skeleton, Title, Text } from "@mantine/core";
import { IconUser, IconAlertTriangle } from "@tabler/icons-react";
import React from "react";
import HelperIcon from "../../components/icon/helper";
import ErrorCard from "../../components/error-card";

const LiveGamesSummaryTable = ({
  data,
  loading,
  error,
  isMobile,
}: {
  data: LiveGameSummary | null;
  loading: boolean;
  error: any;
  isMobile: boolean;
}) => {
  if (error) {
    return <ErrorCard title={"Error getting the live games summary"} body={`${error}`} />;
  }

  return (
    <>
      <Card p="md" shadow="sm" withBorder style={{ maxWidth: 520, minHeight: 170 }}>
        <Card.Section pl={"xs"} pr={"xs"}>
          <Group m="xs" justify={isMobile ? "center" : "space-between"}>
            <Title order={4}>Live Games Summary</Title>
            <Group gap={4}>
              {!loading && data && (
                <Title order={5}>
                  {new Date(data.liveGameSummary.unixTimeStamp * 1000).toLocaleString()}
                </Title>
              )}
              {loading && <Skeleton height={15} width="150" radius="xl" />}
              <HelperIcon
                text={
                  "Current multiplayer games in progress.  Total Players are unique filtered. Keep in mind that there are probably a lot of players in lobby / searching / loading and doing other things. Custom games are not observable by default. Most likely there is much more custom games being played. Games are updated every 5 minutes."
                }
              />
            </Group>
          </Group>
        </Card.Section>
        {!loading && data?.liveGameSummary.totalAutomatch.players === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <IconAlertTriangle size={20} />
            <Title order={5}>No Live Games Detected</Title>
            <Text size="sm" c="dimmed">
              COH3 Stats may need to update after a recent game patch.
            </Text>
          </div>
        ) : (
          <Group gap={"md"} justify={isMobile ? "center" : "space-between"}>
            <div
              style={{
                display: "grid",
                // gridTemplateColumns: " [col1] 57% [col2] 40%",
                // gridColumnGap: "15px",
                // paddingBottom: "20px",
                width: "220px",
              }}
            >
              <div style={{ gridColumn: 1, justifySelf: "start" }}>1 vs 1</div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["1v1"].games} games
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["1v1"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>2 vs 2</div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["2v2"].games} games
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["2v2"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>3 vs 3</div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["3v3"].games} games
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["3v3"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>4 vs 4</div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["4v4"].games} games
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["4v4"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}
            </div>
            {!isMobile && <Divider orientation="vertical" size="sm" />}
            <div
              style={{
                display: "grid",
                // gridTemplateColumns: " [col1] 57% [col2] 40%",
                // gridColumnGap: "15px",
                // paddingBottom: "20px",
                width: "220px",
              }}
            >
              <div style={{ gridColumn: 1, justifySelf: "start" }}>vs AI</div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["ai"].games} games
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["ai"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>Custom</div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["custom"].games} games
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["custom"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}
              <div style={{ gridColumn: "1 / 3", justifySelf: "start" }}>Total in Automatch</div>
              {loading && (
                <div style={{ gridColumn: 3, justifySelf: "end" }}>
                  <Skeleton height={13} width="60px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <div style={{ gridColumn: 3, justifySelf: "end" }}>
                  <Group gap={4}>
                    {data.liveGameSummary.totalAutomatch.players}
                    <IconUser size={17} />
                  </Group>
                </div>
              )}

              <div style={{ gridColumn: "1 / 3", justifySelf: "start" }}>Total in any game</div>
              {loading && (
                <div style={{ gridColumn: 3, justifySelf: "end" }}>
                  <Skeleton height={13} width="60px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <div style={{ gridColumn: 3, justifySelf: "end", fontWeight: "bold" }}>
                  <Group gap={4}>
                    {data.liveGameSummary.total.players}
                    <IconUser size={17} />
                  </Group>
                </div>
              )}
            </div>
          </Group>
        )}
      </Card>
    </>
  );
};

export default LiveGamesSummaryTable;
