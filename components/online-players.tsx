import { Badge, Tooltip } from "@mantine/core";
import React, { useEffect, useState } from "react";

export const OnlinePlayers: React.FC = () => {
  const [onlinePlayersData, setOnlinePlayersData] = useState<null | {
    playerCount: number;
    timeStampMs: number;
  }>(null);

  useEffect(() => {
    (async () => {
      const fetchData = await fetch("/api/onlineSteamPlayers");
      setOnlinePlayersData(await fetchData.json());

      // Update the data every 5 minutes
      const intervalId = setInterval(async () => {
        const fetchData = await fetch("/api/onlineSteamPlayers");
        setOnlinePlayersData(await fetchData.json());
      }, 1000 * 60 * 5);

      return () => {
        clearInterval(intervalId);
      };
    })();
  }, []);

  return (
    <Tooltip
      label={`Amount of online players in Company of Heroes 3 as of ${new Date(
        onlinePlayersData?.timeStampMs || "",
      ).toLocaleString()}`}
      multiline
      width={200}
      withArrow
    >
      <div>
        Players in game{" "}
        <Badge color="green" variant="filled" size="lg" style={{ minWidth: 60 }}>
          {onlinePlayersData?.playerCount}
        </Badge>
      </div>
    </Tooltip>
  );
};
