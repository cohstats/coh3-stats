import { Container, Group, Space, Text, Anchor, Tooltip } from "@mantine/core";

import React from "react";
import { Discord } from "../icon/discord";
import { Donate } from "../icon/donate";
import { Github } from "../icon/github";
import Link from "next/link";
import config from "../../config";

import classes from "./Footer.module.css";
import { useTranslation } from "next-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation("common");
  // We can't use useColorScheme in NextJS
  // https://mantine.dev/theming/color-schemes/#color-scheme-value-caveats
  // const colorScheme = useColorScheme();

  return (
    <>
      <footer className={classes.footer}>
        <Container size={"lg"}>
          <Group justify="space-between">
            <Text c="dimmed" size="sm">
              © 2023 - 2026 COH3stats.com,{" "}
              <Tooltip
                multiline
                w={200}
                withArrow
                label={`${t("footer.gamePatchInfo")} ${
                  config.latestPatch
                }, exported ${config.patches[config.latestPatch].dataTime}`}
              >
                <span>
                  {t("footer.gamePatch")} {config.latestPatch}
                </span>
              </Tooltip>
              <br />
              {t("footer.unofficialSite")}
            </Text>
            <Group gap={5} justify="right" wrap="nowrap">
              <Text c="dimmed" size="sm"></Text>
              <Discord />
              <Github />
              <Donate />
            </Group>
          </Group>
          <br />
        </Container>
        <Text c="dimmed" size="xs" style={{ textAlign: "center" }}>
          {t("footer.trademark")}
          <br />
          {t("footer.assets")}
        </Text>
        {/*Looks like we can't have Space inside Text element?! Hydration failure*/}
        <Space h="md" />
        <Text c="dimmed" size="xs" style={{ textAlign: "center" }}>
          {t("footer.visitText1")}{" "}
          <Anchor component={Link} href={"https://coh2stats.com"} target={"_blank"}>
            coh2stats.com{" "}
          </Anchor>{" "}
          {t("footer.visitText2")}
        </Text>
      </footer>
    </>
  );
};
