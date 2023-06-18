import { Anchor, Card, createStyles, Group, Image, Stack, Text, Title } from "@mantine/core";
import LinkWithOutPrefetch from "../../LinkWithOutPrefetch";
import { getDPSCalculatorRoute, getUnitBrowserRoute } from "../../../src/routes";
import { getIconsPathOnCDN } from "../../../src/utils";

const useStyles = createStyles((theme) => ({
  card: {
    maxHeight: 170,
    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
    }),
  },
}));

const InfoCard = ({
  link,
  content,
  title,
  imageSrc,
}: {
  link: string;
  content: string;
  title: string;
  imageSrc: string;
}) => {
  const { classes } = useStyles();

  return (
    <Anchor
      color="orange"
      component={LinkWithOutPrefetch}
      href={link}
      style={{ textDecoration: "none" }}
    >
      <Card padding="md" radius="md" withBorder className={classes.card}>
        <Stack>
          <Group position="apart">
            <Title order={4}>{title}</Title>
            <Image width={25} height={25} fit="contain" src={imageSrc} alt="" withPlaceholder />
          </Group>

          <Text size="sm">{content}</Text>
        </Stack>
      </Card>
    </Anchor>
  );
};

const DPSCalculatorCard = () => {
  return (
    <InfoCard
      link={getDPSCalculatorRoute()}
      title={"DPS Calculator"}
      imageSrc={getIconsPathOnCDN("/icons/races/common/symbols/hmg.png")}
      content={
        "Compare DPS of all units in the game. Customize the unit load out with different weapons. You can take into consideration also HP of the units."
      }
    />
  );
};

const UnitBrowserCard = () => {
  return (
    <InfoCard
      link={getUnitBrowserRoute()}
      title={"Unit Browser"}
      imageSrc={getIconsPathOnCDN("/icons/common/squad/squad.png")}
      content={
        "Browse all units in the game. See their stats, weapons, upgrades and all the other stuff. See Explorer menu for faction overview and more."
      }
    />
  );
};

export { DPSCalculatorCard, UnitBrowserCard };
