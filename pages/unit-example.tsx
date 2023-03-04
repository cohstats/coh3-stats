import React from "react";
import { Container, Title, Text, Grid, Tooltip, Card } from "@mantine/core";
import { StatCosts } from "../components/Stats";

/**
 * This is example page you can find it by going on ur /unit-example
 * @constructor
 */
const UnitExample = () => {
  return (
    <Container size="lg">
      <Title order={2} mb={8}>
        <Text fw={700}>This is an example Unit Stats Page.</Text>
      </Title>
      <Grid columns={3} gutter="md">
        <Grid.Col span={3} sm={2}>
          <Text w={700}>Side Example description and components goes here!</Text>
        </Grid.Col>
        <Grid.Col span={3} sm={1}>
          <Tooltip label="Stats Card tooltip">
            <Card bg="dark" p="lg" radius="md" withBorder>
              <StatCosts fuel={120} manpower={50} pop={100}></StatCosts>
            </Card>
          </Tooltip>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

UnitExample.propTypes = {};

export default UnitExample;
