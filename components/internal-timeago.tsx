import { Text } from "@mantine/core";
import { format } from "timeago.js";
import React from "react";

const InternalTimeAgo = ({ timestamp }: { timestamp: number }) => {
  return <Text>{format(timestamp * 1000, "en")}</Text>;
};

export default InternalTimeAgo;
