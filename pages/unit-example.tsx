import React from "react";
import {
  Container,
  Title,
  Text,
  Grid,
  Flex,
  Tooltip,
  Card,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { StatsCosts } from "../components/unit-cards/cost-card";
import { StatsVehicleArmor } from "../components/unit-cards/vehicle-armor-card";
import { UnitDescriptionCard } from "../components/unit-cards/unit-description-card";
import { UnitUpgradeCard } from "../components/unit-cards/unit-upgrade-card";

/**
 * This is example page you can find it by going on ur /unit-example
 * @constructor
 */
const UnitExample = () => {
  return (
    <Container fluid>
      <Title order={3} mb={8}>
        <Text fw={700}>This is an example Unit Stats Page.</Text>
      </Title>
      <Grid columns={3} gutter="md">
        {/* Left Side */}
        <Grid.Col span={3} sm={2}>
          <SimpleGrid cols={2}>
            <Card p="lg" radius="md" withBorder>
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
            <Card p="lg" radius="md" withBorder>
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

          <Stack mt={16}>
            <Title order={4}>Upgrades</Title>
            <Stack>
              <Card p="lg" radius="md" withBorder>
                <UnitUpgradeCard
                  id={"up_lanciafiamme"}
                  desc={{
                    extra_text: "Conversion upgrade",
                    screen_name: "L6 Lanciafiamme Conversion",
                    help_text: "Deals Area of Effect damage and ignores cover.",
                    brief_text: "Upgrades the unit into the L6/40 Light Flame Tank.",
                    icon_name: "races\\afrika_corps\\upgrades\\lanciaflamme",
                  }}
                  time_cost={{
                    munition: 75.0,
                    time_seconds: 30.0,
                  }}
                ></UnitUpgradeCard>
              </Card>
              <Card p="lg" radius="md" withBorder>
                <UnitUpgradeCard
                  id={"up_spotting_scopes"}
                  desc={{
                    extra_text: "Support upgrade",
                    screen_name: "Spotting Scopes",
                    help_text: "Increases Line of Sight when stationary.",
                    brief_text: "Upgrades the unit with a spotting scope.",
                    icon_name: "common\\abilities\\scan_kettenkrad_ger",
                  }}
                  time_cost={{
                    munition: 30.0,
                    time_seconds: 30.0,
                  }}
                ></UnitUpgradeCard>
              </Card>
            </Stack>
          </Stack>
        </Grid.Col>

        {/* Right Side */}
        <Grid.Col span={3} sm={1}>
          <Flex gap="md" direction="column">
            <Tooltip label="Stats Card tooltip">
              <Card p="lg" radius="md" withBorder>
                <StatsCosts
                  key="ex_cost"
                  fuel={15.0}
                  manpower={225.0}
                  popcap={6}
                  time_seconds={45.0}
                ></StatsCosts>
              </Card>
            </Tooltip>
            <Tooltip label="Example heavy tank">
              <Card p="lg" radius="md" withBorder>
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
              <Card p="lg" radius="md" withBorder>
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
