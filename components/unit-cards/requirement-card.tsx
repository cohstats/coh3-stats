import { Flex, HoverCard, Text, Title } from "@mantine/core";
import ImageWithFallback, { iconPlaceholder } from "../placeholders";
import { UpgradesType } from "../../src/unitStats";

export const RequirementCard = ({ ui }: UpgradesType) => {
  const spaceRegex = /\\r?\\n|\\r|\\n/g;
  const specialRegex = /\*/g;

  const briefText = ui.briefText?.replace(spaceRegex, "\n")?.replace(specialRegex, "");

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
        <Flex direction="column" gap={4}>
          <Title order={4} transform="capitalize">
            {ui.screenName}
          </Title>
          <Title order={6} color="yellow.5">
            {ui.extraText}
          </Title>
          <Text fz="sm" style={{ whiteSpace: "pre-line" }} italic>
            {briefText}
          </Text>
          {/* <Text fz="sm">{ui.helpText}</Text> */}
        </Flex>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};
