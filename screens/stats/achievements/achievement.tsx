import { Card, Flex, Image, Progress, Text, Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface AchievementProps {
  achievement: {
    defaultvalue: number;
    displayName: string;
    hidden: number;
    description: string;
    icon: string;
    icongray: string;
    globalPercent: number;
  };
}

const Achievement = ({ achievement }: AchievementProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Card my={5}>
      <Flex justify={"space-between"} align={"center"} direction={"row"} mx={10}>
        <Card.Section>
          <Image src={achievement.icon} alt="" height={isMobile ? 50 : 100}></Image>
        </Card.Section>
        <Card.Section w={isMobile ? "80%" : 500}>
          <Flex gap={5} direction={"column"}>
            <Text fw={"bold"} size={isMobile ? "md" : "lg"}>
              {achievement.displayName}
            </Text>
            <Text size={isMobile ? "xs" : "sm"}>{achievement.description}</Text>
            <Tooltip label="">
              <Progress
                radius={"xs"}
                size={isMobile ? "md" : "xl"}
                value={achievement.globalPercent}
                label={`${achievement.globalPercent.toFixed(1)}%`}
              />
            </Tooltip>
          </Flex>
        </Card.Section>
      </Flex>
    </Card>
  );
};

export default Achievement;
