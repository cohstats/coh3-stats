import { Text, Tooltip } from "@mantine/core";
import { format } from "timeago.js";
import React from "react";

const InternalTimeAgo = ({ timestamp }: { timestamp: number }) => {
  return (
    <Tooltip label={new Date(timestamp * 1000).toLocaleString()}>
      <Text>{format(timestamp * 1000, "en")}</Text>
    </Tooltip>
  )
  
};

export default InternalTimeAgo;
