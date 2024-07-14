import { Anchor, Card, Group, Image, Stack, Text, Title } from "@mantine/core";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import { getDPSCalculatorRoute, getUnitBrowserRoute } from "../../src/routes";
import { getIconsPathOnCDN } from "../../src/utils";
import {useColorScheme} from "@mantine/hooks";

// const useStyles = createStyles((theme) => ({
//   card: {
//     maxHeight: 170,
//     ...theme.fn.hover({
//       backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
//     }),
//   },
// }));

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
  const colorScheme = useColorScheme();

  // const { classes } = useStyles();

  return (
    <Anchor
      c="orange"
      component={LinkWithOutPrefetch}
      href={link}
      style={{ textDecoration: "none" }}
    >
      <Card padding={14} radius="md" withBorder style={{
        maxHeight: 170,
        // TODO: This needs to be on hover
        // backgroundColor: colorScheme === "dark" ? 'var(--mantine-colors-dark-5)' : 'var(--mantine-colors-gray-1)',
      }}>
        <Stack gap={"xs"}>
          <Group justify="apart">
            <Title order={4}>{title}</Title>
            <Image width={25} height={25} fit="contain" src={imageSrc} alt="" fallbackSrc={"https://placehold.co/25x25?text=X"} />
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
      imageSrc={getIconsPathOnCDN("/icons/races/common/symbols/hmg.webp")}
      content={
        "Compare DPS of all units in the game. Customize the unit load out with different weapons. You can also take into consideration the HP of the units."
      }
    />
  );
};

const UnitBrowserCard = () => {
  return (
    <InfoCard
      link={getUnitBrowserRoute()}
      title={"Unit Browser"}
      imageSrc={getIconsPathOnCDN("/icons/common/squad/squad.webp")}
      content={
        "Explore game units, including stats, weapons, and upgrades. Navigate the Explorer menu for faction overview and more details."
      }
    />
  );
};

export { DPSCalculatorCard, UnitBrowserCard };
