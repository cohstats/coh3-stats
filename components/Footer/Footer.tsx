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
        <Container>
          <Group position="apart">
            <Text color="dimmed" size="sm">
              © 2022 coh3stats.com. All rights reserved.
            </Text>
            <Group spacing={5} className={classes.social} position="right" noWrap>
              <Discord />
              <Github />
              <Donate />
            </Group>
          </Group>
        </Container>
      </footer>
    </>
  );
};
