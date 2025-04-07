import { LiveGameSummary } from "../../src/coh3/coh3-types";
import { Card, Divider, Group, Skeleton, Title, Text } from "@mantine/core";
import { IconUser, IconAlertTriangle } from "@tabler/icons-react";
import React from "react";
import HelperIcon from "../../components/icon/helper";
import ErrorCard from "../../components/error-card";
import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation("live-games");

  if (error) {
    return <ErrorCard title={t("gamesTable.errors.summaryTitle")} body={`${error}`} />;
  }

  return (
    <>
      <Card p="md" shadow="sm" withBorder style={{ maxWidth: 620, minHeight: 170 }}>
        <Card.Section pl={"xs"} pr={"xs"}>
          <Group m="xs" justify={isMobile ? "center" : "space-between"}>
            <Title order={4}>{t("summaryTable.title")}</Title>
            <Group gap={4}>
              {!loading && data && (
                <Title order={5}>
                  {new Date(data.liveGameSummary.unixTimeStamp * 1000).toLocaleString()}
                </Title>
              )}
              {loading && <Skeleton height={15} width="150" radius="xl" />}
              <HelperIcon text={t("summaryTable.tooltip")} />
            </Group>
          </Group>
        </Card.Section>
        {!loading && data?.liveGameSummary.totalAutomatch.players === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <IconAlertTriangle size={20} />
            <Title order={5}>{t("summaryTable.noGames.title")}</Title>
            <Text size="sm" c="dimmed">
              {t("summaryTable.noGames.message")}
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
              <div style={{ gridColumn: 1, justifySelf: "start" }}>
                {t("summaryTable.modes.1v1")}
              </div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["1v1"].games} {t("summaryTable.games")}
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["1v1"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>
                {t("summaryTable.modes.2v2")}
              </div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["2v2"].games} {t("summaryTable.games")}
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["2v2"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>
                {t("summaryTable.modes.3v3")}
              </div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["3v3"].games} {t("summaryTable.games")}
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["3v3"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>
                {t("summaryTable.modes.4v4")}
              </div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["4v4"].games} {t("summaryTable.games")}
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
                width: "250px",
              }}
            >
              <div style={{ gridColumn: 1, justifySelf: "start" }}>
                {t("summaryTable.modes.vsAI")}
              </div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["ai"].games} {t("summaryTable.games")}
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["ai"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}

              <div style={{ gridColumn: 1, justifySelf: "start" }}>
                {t("summaryTable.modes.custom")}
              </div>
              {loading && (
                <div style={{ gridColumn: "2/4", justifySelf: "end" }}>
                  <Skeleton height={13} width="130px" radius="xl" />
                </div>
              )}
              {!loading && data && (
                <>
                  <div style={{ gridColumn: 2, justifySelf: "end" }}>
                    {data.liveGameSummary["custom"].games} {t("summaryTable.games")}
                  </div>
                  <div style={{ gridColumn: 3, justifySelf: "end" }}>
                    <Group gap={4}>
                      {data.liveGameSummary["custom"].players}
                      <IconUser size={17} />
                    </Group>
                  </div>
                </>
              )}
              <div style={{ gridColumn: "1 / 3", justifySelf: "start" }}>
                {t("summaryTable.totals.automatch")}
              </div>
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

              <div style={{ gridColumn: "1 / 3", justifySelf: "start" }}>
                {t("summaryTable.totals.anyGame")}
              </div>
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
