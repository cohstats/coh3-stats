import { Anchor, Card, Group, Image, Stack, Text, Title } from "@mantine/core";
import LinkWithOutPrefetch from "../../components/LinkWithOutPrefetch";
import { getDPSCalculatorRoute, getUnitBrowserRoute } from "../../src/routes";
import { getIconsPathOnCDN } from "../../src/utils";
import classes from "./info-cards.module.css";
import { TFunction } from "next-i18next";

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
  return (
    <Anchor
      component={LinkWithOutPrefetch}
      href={link}
      style={{ textDecoration: "none", width: "100%", height: "100%" }}
    >
      <Card p={{ base: "xs", sm: "sm" }} radius="md" withBorder className={classes.infoCard}>
        <Stack gap={"xs"} style={{ height: "100%" }}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Title order={4} style={{ flex: 1 }}>
              {title}
            </Title>
            <Image
              w={25}
              h={25}
              fit="contain"
              src={imageSrc}
              alt=""
              fallbackSrc={"https://placehold.co/25x25?text=X"}
              style={{ flexShrink: 0 }}
            />
          </Group>

          <Text size="sm" style={{ flex: 1 }}>
            {content}
          </Text>
        </Stack>
      </Card>
    </Anchor>
  );
};

interface CardProps {
  t: TFunction;
}

const DPSCalculatorCard = ({ t }: CardProps) => {
  return (
    <InfoCard
      link={getDPSCalculatorRoute()}
      title={t("sections.tools.dpsCalculator.title")}
      imageSrc={getIconsPathOnCDN("/icons/races/common/symbols/hmg.webp")}
      content={t("sections.tools.dpsCalculator.description")}
    />
  );
};

const UnitBrowserCard = ({ t }: CardProps) => {
  return (
    <InfoCard
      link={getUnitBrowserRoute()}
      title={t("sections.tools.unitBrowser.title")}
      imageSrc={getIconsPathOnCDN("/icons/common/squad/squad.webp")}
      content={t("sections.tools.unitBrowser.description")}
    />
  );
};

export { DPSCalculatorCard, UnitBrowserCard };
