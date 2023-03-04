import React from "react";
import { Container, Title, Text, Grid, Flex, Tooltip, Card } from "@mantine/core";
import { StatCosts } from "../components/Stats";
import { StatsVehicleArmor } from "../components/vehicle-armor-card";

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
          <Flex gap="md" direction="column">
            <Tooltip label="Stats Card tooltip">
              <Card bg="dark" p="lg" radius="md" withBorder>
                <StatCosts key="ex_cost" fuel={120} manpower={50} pop={100}></StatCosts>
              </Card>
            </Tooltip>
            <Tooltip label="Example heavy tank">
              <Card bg="dark" p="lg" radius="md" withBorder>
                <StatsVehicleArmor
                  key="ex_vehc_ht"
                  type="heavy_tank"
                  armorValues={{
                    frontal: 150,
                    side: 120,
                    rear: 86,
                  }}
                ></StatsVehicleArmor>
              </Card>
            </Tooltip>
            <Tooltip label="Example ultra light carrier">
              <Card bg="dark" p="lg" radius="md" withBorder>
                <StatsVehicleArmor
                  key="ex_vehc_ulc"
                  type="ultra_light_carrier"
                  armorValues={{
                    frontal: 20,
                    side: 10,
                    rear: 5,
                  }}
                ></StatsVehicleArmor>
              </Card>
            </Tooltip>
          </Flex>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

UnitExample.propTypes = {};

export default UnitExample;
