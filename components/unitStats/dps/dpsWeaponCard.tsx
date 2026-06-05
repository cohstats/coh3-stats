import {
  Space,
  Text,
  NumberInput,
  Box,
  Group,
  CloseButton,
  HoverCard,
  Card,
  Stack,
} from "@mantine/core";
import { WeaponMember } from "../../../src/unitStats/dpsCommon";
import { WeaponLoadoutCard } from "../../unit-cards/weapon-loadout-card";
import { UnitUpgradeCard } from "../../unit-cards/unit-upgrade-card";
import { Line } from "react-chartjs-2";

interface IDPSProps {
  weapon_member: WeaponMember;
  onNumberChange: any;
  onDeleteMember: any;
}

const config = {
  type: "line",
  data: [],
  plugins: {
    legend: {
      position: "top",
      display: false,
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      min: 0,
      suggestedMax: 35,
      title: {
        display: false,
      },

      grid: {
        lineWidth: 0.5,
        display: false,
      },
    },
  },
};

export const DpsWeaponCard = (props: IDPSProps) => {
  // const weaponMember =

  //const [activeData] = useState(props.weapon_member);
  const isOptionalUpgradeWeapon = props.weapon_member.source === "optional_upgrade";
  const sourceUpgrade = props.weapon_member.sourceUpgrade;
  function onNumberChanged(value: number) {
    const nextValue = Number.isFinite(value) ? Math.max(0, value) : 0;

    props.weapon_member.num = nextValue;
    props.onNumberChange(props.weapon_member);
  }

  function onDeleteWeapon() {
    props.onDeleteMember(props.weapon_member);
    return;
  }

  const lineData = {
    // labels: labels,
    datasets: [
      {
        label: "My First Dataset",
        data: props.weapon_member.dps_default,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  return (
    <>
      <Box
        style={(theme) => ({
          // backgroundColor:
          //   theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
          //border: theme.colorScheme === "dark" ? "solid 1px " + theme.colors.dark[4] : "solid 1px " + theme.colors.gray[4] ,
          padding: theme.spacing.xs,
          borderRadius: theme.radius.md,
          position: "relative",
          color: isOptionalUpgradeWeapon ? "var(--mantine-color-gray-0)" : undefined,
          background: isOptionalUpgradeWeapon
            ? "linear-gradient(135deg, rgba(9, 20, 38, 0.98) 0%, rgba(30, 96, 185, 0.68) 15%, rgba(27, 31, 34, 0.98) 30%)"
            : undefined,
          border: isOptionalUpgradeWeapon ? "1px solid rgba(96, 165, 250, 0.36)" : undefined,
          boxShadow: isOptionalUpgradeWeapon
            ? "inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 12px rgba(96, 165, 250, 0.08)"
            : undefined,
        })}
      >
        {isOptionalUpgradeWeapon && (
          <Text
            component="span"
            title="Upgrade weapon"
            fw={900}
            size="sm"
            style={{
              position: "absolute",
              top: 4,
              left: 7,
              lineHeight: 1,
              color: "rgba(192, 192, 192, 0.95)",
              textShadow: "0 0 7px rgba(255, 255, 255, 0.45)",
              pointerEvents: "none",
            }}
          >
            ★
          </Text>
        )}

        <Group>
          <HoverCard shadow="md" width={580} position="left" offset={50}>
            <HoverCard.Target>
              <Group gap={"xs"}>
                <img
                  width={60}
                  height={20}
                  src={props.weapon_member.image}
                  // fit="cover"
                  alt={props.weapon_member.weapon_id.substring(0, 10)}
                />
                <CloseButton
                  aria-label="Remove weapon"
                  onClick={onDeleteWeapon}
                  c={isOptionalUpgradeWeapon ? "gray.0" : undefined}
                />
              </Group>
            </HoverCard.Target>
            <HoverCard.Dropdown
              p="xs"
              style={{
                maxHeight: "calc(100vh - 32px)",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {isOptionalUpgradeWeapon && sourceUpgrade ? (
                <Card
                  p="md"
                  radius="md"
                  withBorder
                  c="gray.0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(9, 20, 38, 0.98) 0%, rgba(30, 96, 185, 0.72) 18%, rgba(27, 31, 34, 0.98) 30%)",
                    borderColor: "rgba(96, 165, 250, 0.38)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 18px rgba(96, 165, 250, 0.10)",
                    color: "var(--mantine-color-gray-0)",
                  }}
                >
                  <Stack gap="sm">
                    <UnitUpgradeCard
                      id={sourceUpgrade.id}
                      desc={{
                        screen_name: sourceUpgrade.ui.screenName,
                        help_text: sourceUpgrade.ui.helpText,
                        extra_text: sourceUpgrade.ui.extraText,
                        brief_text: sourceUpgrade.ui.briefText,
                        icon_name: sourceUpgrade.ui.iconName,
                        extra_text_formatter: sourceUpgrade.ui.extraTextFormatter,
                        brief_text_formatter: sourceUpgrade.ui.briefTextFormatter,
                      }}
                      time_cost={sourceUpgrade.cost}
                    />

                    <Card p="lg" radius="md" withBorder>
                      {WeaponLoadoutCard(
                        props.weapon_member.weapon,
                        props.weapon_member.upgradeCount ?? 1,
                      )}
                    </Card>
                  </Stack>
                </Card>
              ) : (
                <Card p="lg" radius="md">
                  {WeaponLoadoutCard(props.weapon_member.weapon, 1)}
                </Card>
              )}

              <Line
                key={props.weapon_member.weapon_id}
                data={lineData}
                options={config as any}
                redraw
              />
              {/* <Stack mb={12}>
                <Space></Space>

                <Text>{activeData.weapon_id}</Text>
                <Divider my="sm" />
                <Grid gutter="xs">
                  <Grid.Col md={4} span={4}>
                    Accuracy:
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {weapon_bag.accuracy_near}
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {weapon_bag.accuracy_mid}
                  </Grid.Col>
                  <Grid.Col md={2} span={2}>
                    {weapon_bag.accuracy_far}
                  </Grid.Col>
                </Grid>

                <Grid gutter="xs">
                  <Grid.Col md={4} span={4}>
                    RPM:
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_near))}
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_mid))}
                  </Grid.Col>
                  <Grid.Col md={2} span={2}>
                    {Math.round(getWeaponRpm(weapon_bag, weapon_bag.range_distance_far))}
                  </Grid.Col>
                </Grid>

                <Grid gutter="xs">
                  <Grid.Col md={4} span={4}>
                    Damage:
                  </Grid.Col>
                  <Grid.Col md={3} span={3}>
                    {weapon_bag.damage_min} - {weapon_bag.damage_max}
                  </Grid.Col>
                  <Grid.Col md={3} span={3}></Grid.Col>
                  <Grid.Col md={2} span={2}></Grid.Col>
                </Grid>
                {(activeData.weapon.weapon_cat == "ballistic_weapon" ||
                  activeData.weapon.weapon_cat == "explosive_weapon") && (
                  <>
                    <Grid gutter="xs">
                      <Grid.Col md={4} span={4}>
                        Penetration:{" "}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {weapon_bag.penetration_near}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {weapon_bag.penetration_mid}
                      </Grid.Col>
                      <Grid.Col md={2} span={2}>
                        {weapon_bag.penetration_far}
                      </Grid.Col>
                    </Grid>

                    <Grid gutter="xs">
                      <Grid.Col md={4} span={4}>
                        Scatter Area:
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {Math.round(getScatterArea(weapon_bag.range.near, weapon_bag))}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {Math.round(getScatterArea(weapon_bag.range.mid, weapon_bag))}
                      </Grid.Col>
                      <Grid.Col md={2} span={2}>
                        {Math.round(getScatterArea(weapon_bag.range.far, weapon_bag))}
                      </Grid.Col>
                    </Grid>
                    <Grid gutter="xs">
                      <Grid.Col md={4} span={4}>
                        AoE Radius:
                      </Grid.Col>
                      <Grid.Col md={3} span={3}>
                        {weapon_bag.aoe_outer_radius}
                      </Grid.Col>
                      <Grid.Col md={3} span={3}></Grid.Col>
                      <Grid.Col md={2} span={2}></Grid.Col>
                    </Grid>
                  </>
                )}
              </Stack> */}
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>

        <Text size="xs">{props.weapon_member.weapon_id.substring(0, 12) + "..."}</Text>
        <Space h="xs" />
        <NumberInput
          w={"60px"}
          value={props.weapon_member.num ?? 0}
          min={0}
          size="xs"
          onChange={(value) => onNumberChanged(Number(value) || 0)}
        />
      </Box>
    </>
  );
};
