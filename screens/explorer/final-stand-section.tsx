import { Anchor, Card, Flex, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { raceType, raceTypeArray } from "../../src/coh3/coh3-types";
import { localizedNames } from "../../src/coh3/coh3-data";
import FactionIcon from "../../components/faction-icon";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import {
  getExplorerFsPerksRoute,
  getExplorerFsTechRoute,
  getExplorerFsUnitsRoute,
} from "../../src/routes";

const FactionLinkCard = ({
  faction,
  href,
  title,
}: {
  faction: raceType;
  href: string;
  title: string;
}) => {
  return (
    <Anchor c="undefined" underline={"never"} component={LinkWithOutPrefetch} href={href}>
      <Card p="sm" radius="md" withBorder>
        <Flex direction="row" justify="space-between" align="center">
          <Flex direction="row" align="center" gap="md">
            <FactionIcon name={faction} width={64} />
            <Title order={3} size="h4" fw="bold">
              {title}
            </Title>
          </Flex>
          <IconChevronRight size={16} />
        </Flex>
      </Card>
    </Anchor>
  );
};

/**
 * Links to all the Final Stand DLC pages (perks, units, technologies) of every faction.
 * Used on the explorer index page and on the Final Stand explorer page.
 */
const FinalStandSection = ({ showTitle = true }: { showTitle?: boolean }) => {
  const { t } = useTranslation(["explorer"]);

  const groups = [
    {
      key: "perks",
      heading: t("explorer.finalStand.perksHeading"),
      cardTitleKey: "explorer.finalStand.perksCardTitle",
      getHref: getExplorerFsPerksRoute,
    },
    {
      key: "units",
      heading: t("explorer.finalStand.unitsHeading"),
      cardTitleKey: "explorer.finalStand.unitsCardTitle",
      getHref: getExplorerFsUnitsRoute,
    },
    {
      key: "tech",
      heading: t("explorer.finalStand.techHeading"),
      cardTitleKey: "explorer.finalStand.techCardTitle",
      getHref: getExplorerFsTechRoute,
    },
  ];

  return (
    <Stack gap="md">
      {showTitle && (
        <>
          <Title order={2}>{t("explorer.finalStand.title")}</Title>
          <Text size="sm" c="dimmed">
            {t("explorer.finalStand.description")}
          </Text>
        </>
      )}

      {groups.map((group) => (
        <Stack gap="md" key={group.key}>
          <Title order={3} size="h5">
            {group.heading}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {raceTypeArray.map((faction) => (
              <FactionLinkCard
                key={`explorer_fs_${group.key}_${faction}`}
                faction={faction}
                href={group.getHref(faction)}
                title={t(group.cardTitleKey, { faction: localizedNames[faction] })}
              />
            ))}
          </SimpleGrid>
        </Stack>
      ))}
    </Stack>
  );
};

export default FinalStandSection;
