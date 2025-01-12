import { Container, Group, Space, Text, Anchor, Tooltip } from "@mantine/core";

import React from "react";
import { Discord } from "../icon/discord";
import { Donate } from "../icon/donate";
import { Github } from "../icon/github";
import Link from "next/link";
import config from "../../config";

import classes from "./Footer.module.css";

export const Footer: React.FC = () => {
  // We can't use useColorScheme in NextJS
  // https://mantine.dev/theming/color-schemes/#color-scheme-value-caveats
  // const colorScheme = useColorScheme();

  return (
    <>
      <footer className={classes.footer}>
        <Container size={"lg"}>
          <Group justify="space-between">
            <Text c="dimmed" size="sm">
              © 2025 COH3stats.com,{" "}
              <Tooltip
                multiline
                w={200}
                withArrow
                label={`Data displayed on the site are from game patch ${
                  config.latestPatch
                }, exported ${config.patches[config.latestPatch].dataTime}`}
              >
                <span>Game patch {config.latestPatch}</span>
              </Tooltip>
              <br />
              This is an unofficial fan-made site for Company&nbsp;Of&nbsp;Heroes&nbsp;3.
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
          The Company of Heroes is a registered trademark of SEGA&nbsp;Holdings Co.
          <br />
          The COH Images and other assets are owned by
          Relic&nbsp;Entertainment&nbsp;and/or&nbsp;SEGA
        </Text>
        {/*Looks like we can't have Space inside Text element?! Hydration failure*/}
        <Space h="md" />
        <Text c="dimmed" size="xs" style={{ textAlign: "center" }}>
          Visit{" "}
          <Anchor component={Link} href={"https://coh2stats.com"} target={"_blank"}>
            coh2stats.com{" "}
          </Anchor>{" "}
          for Company of Heroes 2 stats and analytics
        </Text>
      </footer>
    </>
  );
};
