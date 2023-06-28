import { Badge, Tooltip } from "@mantine/core";
import React, { useEffect, useState } from "react";

export const OnlinePlayers: React.FC = () => {
  const [onlinePlayersData, setOnlinePlayersData] = useState<null | {
    playerCount: number;
    timeStampMs: number;
  }>(null);

  useEffect(() => {
    (async () => {
      try {
        if (
          onlinePlayersData &&
          onlinePlayersData.timeStampMs < new Date().getTime() - 1000 * 60 * 4
        ) {
          const fetchData = await fetch("/api/onlineSteamPlayers");
          setOnlinePlayersData(await fetchData.json());
        }

        // Update the data every 5 minutes
        const intervalId = setInterval(async () => {
          try {
            if (
              onlinePlayersData &&
              onlinePlayersData.timeStampMs < new Date().getTime() - 1000 * 60 * 4
            ) {
              const fetchData = await fetch("/api/onlineSteamPlayers");
              setOnlinePlayersData(await fetchData.json());
            }
          } catch (e) {
            console.error(e);
          }
        }, 1000 * 60 * 5);

        return () => {
          clearInterval(intervalId);
        };
      } catch (e) {
        console.error(e);
      }
    })();
    // We don't want to have it as a dependency, only during the first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
