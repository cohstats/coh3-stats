import React from "react";
import { Container, Title, Text, Grid, Flex, Tooltip, Card, SimpleGrid } from "@mantine/core";
import { StatsCosts } from "../components/Cards/cost-card";
import { StatsVehicleArmor } from "../components/Cards/vehicle-armor-card";
import { UnitDescriptionCard } from "../components/Cards/unit-description-card";

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
          <SimpleGrid cols={2}>
            <Card bg="dark" p="lg" radius="md" withBorder>
              <Flex h="100%">
                <UnitDescriptionCard
                  screen_name="L6/40 Light Tank"
                  brief_text="Light tank armed with a 20mm autocannon."
                  help_text="Anti-infantry"
                  icon_name="races\\afrika_corps\\vehicles\\l6_40_ak"
                  symbol_icon_name="races\\afrika_corps\\symbols\\l6_40_ak"
                ></UnitDescriptionCard>
              </Flex>
            </Card>
            <Card bg="dark" p="lg" radius="md" withBorder>
              <Flex h="100%">
                <UnitDescriptionCard
                  screen_name="Carro Armato M13/40 Light Tank"
                  brief_text="Light tank armed with a 47mm gun and three Breda 38 machine guns."
                  help_text="Anti-infantry / Anti-vehicle"
                  icon_name="races\\afrika_corps\\vehicles\\m13_40_ak"
                  symbol_icon_name="races\\german\\symbols\\m13_40_ger"
                ></UnitDescriptionCard>
              </Flex>
            </Card>
          </SimpleGrid>
        </Grid.Col>
        <Grid.Col span={3} sm={1}>
          <Flex gap="md" direction="column">
            <Tooltip label="Stats Card tooltip">
              <Card bg="dark" p="lg" radius="md" withBorder>
                <StatsCosts key="ex_cost" fuel={120} manpower={50} popcap={100}></StatsCosts>
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
