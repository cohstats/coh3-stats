import { Badge, Flex, Tooltip } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { getNumberOfOnlinePlayersSteamUrl } from "../src/apis/steam-api";

const fetchOnlinePlayers = async () => {
  try {
    const fetchData = await fetch(getNumberOfOnlinePlayersSteamUrl());
    const data = await fetchData.json();
    if (data?.response?.player_count > 0) {
      return {
        playerCount: data.response.player_count,
        timeStampMs: new Date(fetchData.headers.get("last-modified") || "").getTime(),
      };
    }
    return null;
  } catch (e) {
    console.error("Error fetching online players:", e);
    return null;
  }
};

const shouldFetchData = (
  currentData: {
    playerCount: number;
    timeStampMs: number;
  } | null,
) => {
  if (!currentData) return true;
  const fourMinutesAgo = new Date().getTime() - 1000 * 60 * 4;
  return currentData.timeStampMs < fourMinutesAgo;
};

export const OnlinePlayers: React.FC = () => {
  const [onlinePlayersData, setOnlinePlayersData] = useState<null | {
    playerCount: number;
    timeStampMs: number;
  }>(null);

  useEffect(() => {
    const updateData = async () => {
      if (shouldFetchData(onlinePlayersData)) {
        const newData = await fetchOnlinePlayers();
        if (newData) {
          setOnlinePlayersData(newData);
        }
      }
    };

    // Initial fetch if needed
    updateData();

    // Set up interval for subsequent fetches
    const intervalId = setInterval(updateData, 1000 * 60 * 5); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array for mounting only

  return (
    <Tooltip
      label={`Number of online players in Company of Heroes 3 as of ${new Date(
        onlinePlayersData?.timeStampMs || "",
      ).toLocaleString()}`}
      multiline
      w={200}
      withArrow
    >
      <Flex gap={3} align={"center"}>
        <div>Players in game </div>
        <Badge color="green" variant="filled" size="lg" style={{ minWidth: 60 }}>
          {onlinePlayersData?.playerCount}
        </Badge>
      </Flex>
    </Tooltip>
  );
};
