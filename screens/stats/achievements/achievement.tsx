import { Card, Image, Progress, Text } from "@mantine/core";
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
    <Card my={10} p={"xs"} radius="md" withBorder>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <Image src={achievement.icon} alt="Achivement icon" height={60} width={60} />
        </div>
        <div style={{ flexGrow: 1, flexBasis: "100%", paddingLeft: 10, paddingRight: 15 }}>
          <div>
            <Text fw={"bold"} size={isMobile ? "md" : "lg"}>
              {achievement.displayName}
            </Text>
            <Text size={isMobile ? "xs" : "sm"}>{achievement.description}</Text>
            <Progress
              radius={"xs"}
              size={"xl"}
              value={achievement.globalPercent}
              label={`${achievement.globalPercent.toFixed(1)}%`}
            />
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Text fw={"bold"} size={"lg"}>
            {achievement.globalPercent.toFixed(1)}%
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default Achievement;
