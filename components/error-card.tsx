import { Card, Group, Text, Badge, Container, Alert, Center, Anchor } from "@mantine/core";
import React from "react";
import { IconAlertCircle } from "@tabler/icons";
import Link from "next/link";
import config from "../config";

/**
 * TODO Please improve the error component / make the border red or something
 * @param title
 * @param body
 * @constructor
 */
const ErrorCard = ({ title, body }: { title: string; body: string }) => {
  const renderTitle = title || "Error";
  const defaultBody = body || "There was an error rendering this component.";

  return (
    <Container size={"sm"} p={"md"}>
      <Center>
        <Alert icon={<IconAlertCircle size="2rem" />} title={renderTitle} color="red" miw={450}>
          {defaultBody}
          <br />
          <br />
          If this error persists, please report it on{" "}
          <Anchor component={Link} href={config.DISCORD_INVITE_LINK} target={"_blank"}>
            Discord
          </Anchor>
          .
        </Alert>
      </Center>
    </Container>
  );
};

export default ErrorCard;
