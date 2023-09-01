import { ActionIcon, Code, Group, HoverCard, Text } from "@mantine/core";
import { IconBrandSteam, IconInfoCircle } from "@tabler/icons-react";
import React from "react";
import RelicIcon from "../../../icon/relic-icon";

const PlayerIdIcon = ({ relicID, steamID }: { relicID: number; steamID?: string }) => {
  return (
    <HoverCard width={265} shadow="md">
      <HoverCard.Target>
        <ActionIcon size="lg" variant="default" radius="md">
          <IconInfoCircle size={25} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Group spacing={"xs"}>
          <RelicIcon size={17} />
          <Text size="sm">Relic COH3 ID</Text>
          <Code>{relicID}</Code>
        </Group>
        {steamID && (
          <Group spacing={"xs"}>
            <IconBrandSteam size={15} />
            <Text size="sm">Steam ID</Text>
            <Code>{steamID}</Code>
          </Group>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

export default PlayerIdIcon;
