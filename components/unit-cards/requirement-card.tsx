import { Flex, HoverCard, Text, Title } from "@mantine/core";
import ImageWithFallback, { iconPlaceholder } from "../placeholders";
import { UpgradesType } from "../../src/unitStats";

export const RequirementCard = ({ ui }: UpgradesType) => {
  return (
    <HoverCard position="top" width={280} shadow="md" withArrow>
      <HoverCard.Target>
        <Flex direction="column" align="center">
          <ImageWithFallback
            width={64}
            height={64}
            src={`/icons/${ui.iconName}.png`}
            alt={ui.screenName}
            fallbackSrc={iconPlaceholder}
          ></ImageWithFallback>
        </Flex>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Flex direction="column">
          <Title order={4} transform="capitalize">
            {ui.screenName}
          </Title>
          <Text fz="md" color="yellow.5">
            {ui.extraText}
          </Text>
          <Text fz="sm">{ui.briefText}</Text>
          <Text fz="sm">{ui.helpText}</Text>
        </Flex>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
