// disable eslint for this file
/* eslint-disable */

import { Anchor, Button, Container, Group, Select, Title } from "@mantine/core";
import React from "react";
import { getMapLocalizedName } from "../../../../src/coh3/helpers";
import { localizedGameTypes, localizedNames } from "../../../../src/coh3/coh3-data";

const DetailedStatsTab = ({}) => {
  const [selectedFaction, setSelectedFaction] = React.useState<string>("german");
  const [selectedGameMode, setSelectedGameMode] = React.useState<string>("1v1");

  return (
    <>
      <Container size={"lg"} p={"md"}>
        <Group>
          <Title order={3}>Detailed Statistics for </Title>
          <Select
            value={selectedFaction}
            label="Faction"
            placeholder={"Select faction"}
            defaultValue={"german"}
            data={
              Object.entries(localizedNames).map(([key, value]) => ({
                value: key,
                label: value,
              })) || []
            }
            onChange={(value) => setSelectedFaction(value || "")}
            // w={180}
          />
          <Select
            value={selectedFaction}
            label="Game Type"
            placeholder={"Select Game Type"}
            defaultValue={"1v1"}
            data={
              Object.entries(localizedGameTypes).map(([key, value]) => ({
                value: key,
                label: value,
              })) || []
            }
            onChange={(value) => setSelectedFaction(value || "")}
            // w={180}
          />
        </Group>
      </Container>
    </>
  );
};

export default DetailedStatsTab;
