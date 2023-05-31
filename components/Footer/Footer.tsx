import { Container, createStyles, Group, Space, Text, Anchor } from "@mantine/core";
import React from "react";
import { Discord } from "../icon/discord";
import { Donate } from "../icon/donate";
import { Github } from "../icon/github";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: theme.spacing.xl,
    paddingTop: `calc(${theme.spacing.xl} * 2)`,
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
  social: {},
}));

export const Footer: React.FC = () => {
  const { classes } = useStyles();

  return (
    <>
      <footer className={classes.footer}>
        <Container size={"lg"}>
          <Group position="apart">
            <Text color="dimmed" size="sm">
              © 2023 COH3stats.com
              <br />
              This is unofficial fan-made site for Company&nbsp;Of&nbsp;Heroes&nbsp;3.
            </Text>
            <Group spacing={5} className={classes.social} position="right" noWrap>
              <Discord />
              <Github />
              <Donate />
            </Group>
          </Group>
          <br />
        </Container>
        <Text color="dimmed" size="xs" style={{ textAlign: "center" }}>
          The Company of Heroes is registered trademark of SEGA&nbsp;Holdings.&nbsp;Co
          <br />
          The COH Images and other assets are owned by
          Relic&nbsp;Entertainment&nbsp;and/or&nbsp;SEGA
          <Space h="xs" />
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
