import { Container, Group, Text } from "@mantine/core";
import React from "react";
import { Discord } from "../icon/discord";
import { Donate } from "../icon/donate";
import { Github } from "../icon/github";
import useStyles from "./Footer.styles";

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
              This is unofficial fan-made site for Company&nbsp;Of&nbsp;Heroes 3.
            </Text>
            <Group spacing={5} className={classes.social} position="right" noWrap>
              <Discord />
              <Github />
              <Donate />
            </Group>
          </Group>
          <br />
        </Container>
        <Text color="dimmed" size="sm" style={{ textAlign: "center" }}>
          The Company of Heroes is registered trademark of SEGA Holdings. Co
          <br />
          The COH Images and other assets are owned by Relic Entertainment and/or SEGA
        </Text>
      </footer>
    </>
  );
};
