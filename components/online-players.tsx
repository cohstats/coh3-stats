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
    })();
  }, []);

  return (
    <Tooltip
      label={`Amount of online players in Company of Heroes 2 as of ${new Date(
        onlinePlayersData?.timeStampMs || "",
      ).toLocaleString()}`}
    >
      <div>
        Ingame players{" "}
        <Badge color="green" variant="filled" size="lg" style={{ minWidth: 60 }}>
          {onlinePlayersData?.playerCount}
        </Badge>
      </div>
    </Tooltip>
  );
};
