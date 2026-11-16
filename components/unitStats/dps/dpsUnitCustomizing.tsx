import React, { useEffect, useState } from "react";
//import { LevelContext } from './LevelContext.js';
import {
  Avatar,
  Button,
  Group,
  Image,
  ActionIcon,
  Stack,
  Flex,
  Grid,
  Tooltip,
  Text,
  Anchor,
  Card,
  HoverCard,
  Space,
  UnstyledButton,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { WeaponSearch } from "./weaponSearch";
import { getIconsPathOnCDN } from "../../../src/utils";
import { WeaponType } from "../../../src/unitStats/mappingWeapon";
import { DpsWeaponCard } from "./dpsWeaponCard";
import { EbpsType, getSquadTotalCost } from "../../../src/unitStats";
import {
  CustomizableUnit,
  getSbpsUpgrades,
  getSbpsWeapons,
  mapWeaponMember,
  resolveFactionLinkid,
  WeaponMember,
  CustomModifiers,
  createDefaultCustomModifiers,
  getModifiedHitpoints,
  getUnitModelCount,
  setUnitVeterancyLevel,
} from "../../../src/unitStats/dpsCommon";
import { getMaxDpsVeterancyLevel } from "../../../src/unitStats/dpsVeterancy";
import { hasScatterAoe } from "../../../src/unitStats/scatterSimulation";
import { humanizeVeterancyModifierId } from "./veterancyModifierDisplay";
import { CustomConfigModal, type CustomModifierScope } from "./CustomConfigModal";
import Link from "next/link";
import { UnitSquadCard } from "../../unit-cards/unit-squad-card";
import { UnitCostCard } from "../../unit-cards/unit-cost-card";
import { HitpointCard } from "../../unit-cards/hitpoints-card";

const vetStarIconPath = "/icons/hud/decorators/vet_star.png";
const vetStarEmptyIconPath = "/icons/hud/decorators/vet_star_empty.png";

interface IUnitProps {
  unit: CustomizableUnit;
  onChange: (...args: any[]) => void;
  index: number;
  ebps: EbpsType[];
  weapons: WeaponType[];
  allowAllWeapons: boolean;
  /** Limit editable modifiers by unit role in Compare Mode; VS Mode defaults to all. */
  modifierScope?: CustomModifierScope;
  fogOfWar?: boolean;
  onFogOfWarChange?: (checked: boolean) => void;
}

export const DpsUnitCustomizing = (props: IUnitProps) => {
  const { t } = useTranslation("explorer");
  const [weaponList, setWeaponList] = useState<WeaponMember[]>([]);
  const [customConfigOpened, setCustomConfigOpened] = useState(false);

  // Create weapon list, `useEffect` to listen for props changes and refresh the
  // weapon data.
  useEffect(() => {
    const sbpsWeapons = getSbpsWeapons(props.unit.sbps, props.ebps, props.weapons);
    const weaponUpgrades = props.allowAllWeapons
      ? props.weapons.map((weapon) => mapWeaponMember(props.unit.sbps, props.ebps[0], weapon))
      : getSbpsUpgrades(props.unit.sbps, props.ebps, props.weapons);
    for (const weaponUpgrade of weaponUpgrades) {
      // check if weapon is already available
      if (sbpsWeapons.find((member) => member.weapon_id == weaponUpgrade.weapon_id)) continue;
      sbpsWeapons.push(weaponUpgrade);
    }
    setWeaponList(sbpsWeapons);
  }, [props.ebps, props.unit.sbps, props.weapons, props.allowAllWeapons]);

  function onAddWeapon(selectionItem: WeaponMember) {
    // check if weapon have already been added
    if (props.unit.weapon_member.find((weapon) => weapon.weapon_id == selectionItem.weapon_id))
      return;
    // Clone Weapon so we can configure it localy
    // clone only when creating an instance. Not when changing.
    const clone = { ...selectionItem };
    if (!clone.num) clone.num = 1;
    //for (const weapon of selectionItem) {
    props.unit.weapon_member.push(clone);
    props.onChange(props.unit);
  }

  // Weapon number changed
  function onWeaponNumberChange() {
    //const weapon = props.unit.weapon_member.find((mem) => mem.weapon_id == member.weapon_id);
    //if (weapon) weapon.num = member.num;
    props.onChange(props.unit);
  }

  function onMovingChange() {
    props.unit.is_moving = !props.unit.is_moving;
    props.onChange(props.unit);
  }

  function onCoverChange(cover: string) {
    if (props.unit.cover != cover) props.unit.cover = cover;
    else props.unit.cover = "";
    props.onChange(props.unit);
  }

  // Weapon card deleted
  function onDelete(member: WeaponMember) {
    props.unit.weapon_member.forEach((ldout) => {
      if (ldout === member) {
        const index = props.unit.weapon_member.indexOf(ldout);
        props.unit.weapon_member.splice(index, 1);
      }
    });
    props.onChange(props.unit);
  }

  function onCustomConfigChange(modifiers: CustomModifiers) {
    props.unit.custom_modifiers = modifiers;
    props.onChange(props.unit);
  }

  function onCustomConfigOpen() {
    // Ensure custom_modifiers exists
    if (!props.unit.custom_modifiers) {
      props.unit.custom_modifiers = createDefaultCustomModifiers();
    }
    setCustomConfigOpened(true);
  }

  // Match the unit veterancy card: lit / empty game-star images, only smaller.
  // Clicking the currently selected level returns the unit to Vet 0.
  const maxVeterancy = getMaxDpsVeterancyLevel(props.unit);
  const selectedVeterancy = Math.max(
    0,
    Math.min(maxVeterancy, Math.floor(Number(props.unit.veterancyLevel ?? 0) || 0)),
  );
  function onVeterancyChange(level: number) {
    setUnitVeterancyLevel(props.unit, selectedVeterancy === level ? 0 : level);
    props.onChange(props.unit);
  }
  const veterancyRanks = [
    props.unit.sbps.veterancyInfo?.one,
    props.unit.sbps.veterancyInfo?.two,
    props.unit.sbps.veterancyInfo?.three,
    props.unit.sbps.veterancyInfo?.four,
  ];

  const components: any[] = [];
  // create weapon member
  for (const member of props.unit.weapon_member) {
    components.push(
      <DpsWeaponCard
        weapon_member={member}
        key={`${member.weapon_id}.${member.hardpointIndex ?? "manual"}.${props.index}.${member.num}`}
        onDeleteMember={onDelete}
        onNumberChange={onWeaponNumberChange}
      />,
    );
  }
  const totalCost = getSquadTotalCost(props.unit.sbps, props.ebps);
  // These upgrades belong to individual attacker instances, not the global
  // comparison. "Allow All Weapons" also allows captured/foreign vehicles.
  const compareVehicle =
    props.modifierScope === "offensive" && props.unit.unit_type === "vehicles";
  const hasVehicleMg = props.unit.weapon_member.some(
    (member) => member.num > 0 && !hasScatterAoe(member.weapon.weapon_bag),
  );
  const hasCoaxOrHull = props.unit.weapon_member.some(
    (member) => member.num > 0 && (member.hardpointIndex === 1 || member.hardpointIndex === 2),
  );
  // In normal mode, avoid showing upgrades on vehicles with no affected gun.
  // Allow All Weapons deliberately exposes both switches on every vehicle.
  const showHeavyBarrels =
    compareVehicle &&
    (props.allowAllWeapons || (props.unit.faction === "american" && hasVehicleMg));
  const showDakCoax =
    compareVehicle &&
    (props.allowAllWeapons || (props.unit.faction === "afrika_korps" && hasCoaxOrHull));
  const onVehicleUpgradeToggle = (upgrade: "heavyBarrelsEnabled" | "dakCoaxUpgradeEnabled") => {
    props.unit[upgrade] = !props.unit[upgrade];
    props.onChange(props.unit);
  };

  return (
    <>
      <Stack align="left" justify="flex-start" gap="xs">
        <Grid gap="xs">
          <Grid.Col span={5}>
            <Group wrap="nowrap">
              <Tooltip label={props.unit.screen_name}>
                <HoverCard shadow="md" width={450} position="left" offset={50}>
                  <HoverCard.Target>
                    <Group>
                      <Anchor
                        c="undefined"
                        underline={"never"}
                        style={{
                          "&:hover": {
                            textDecoration: "none",
                          },
                        }}
                        component={Link}
                        href={
                          `/explorer/races/${resolveFactionLinkid(props.unit.faction)}/units/` +
                          props.unit.id
                        }
                      >
                        <Avatar
                          src={props.unit.icon_name}
                          alt={props.unit.screen_name}
                          // placeholder="/icons/general/infantry_icn.png"
                          radius="xs"
                          size="md"
                        />
                        {/* <Card p="lg" radius="md" withBorder>
                  {UnitDescriptionCard(desc)}
                  {UnitCostCard(time_cost)}
                </Card> */}
                      </Anchor>
                    </Group>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Stack>
                      <UnitSquadCard
                        id={props.unit.id}
                        ui={{ armorIcon: props.unit.sbps.ui.armorIcon }}
                        health={{
                          armor: props.unit.ebps_default.health.armorLayout.armor,
                          frontal: props.unit.ebps_default.health.armorLayout.frontArmor,
                          rear: props.unit.ebps_default.health.armorLayout.rearArmor,
                          side: props.unit.ebps_default.health.armorLayout.sideArmor,
                          targetSize: props.unit.ebps_default.health.targetSize,
                        }}
                        type={props.unit.unit_type}
                        sight={{
                          coneAngle: 1,
                          outerRadius:
                            props.unit.ebps_default.sight_ext.sight_package.outer_radius,
                          tp_global:
                            props.unit.ebps_default.sight_ext.detect_camouflage?.tp_global ?? 0,
                        }}
                        moving={{
                          defaultSpeed:
                            props.unit.ebps_default.moving_ext.speed_scaling_table.default_speed,
                          maxSpeed:
                            props.unit.ebps_default.moving_ext.speed_scaling_table.max_speed,
                          acceleration: props.unit.ebps_default.moving_ext.acceleration,
                          deceleration: props.unit.ebps_default.moving_ext.deceleration,
                          rotation: props.unit.ebps_default.moving_ext.rotation_rate,
                        }}
                        range={{
                          max: props.unit.weapon_member[0]?.weapon.weapon_bag.range.max || 0,
                        }}
                        capture={{
                          cap: props.unit.sbps.capture_rate,
                          decap: props.unit.sbps.capture_revert,
                        }}
                      />
                      {UnitCostCard(totalCost)}
                    </Stack>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Tooltip>
              <Flex align="center">
                <HoverCard width={400} position="left" offset={80}>
                  <HoverCard.Target>
                    <Image src="/icons/general/health.png" alt="Health" w={32} h={32} />
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Card p="sm" radius="md">
                      {HitpointCard({
                        squad: props.unit.sbps,
                        entities: props.ebps,
                        modifiedHitpoints: getModifiedHitpoints(props.unit),
                        modelCount: getUnitModelCount(props.unit),
                      })}
                    </Card>
                  </HoverCard.Dropdown>
                </HoverCard>
                <Space w="xs" />
                <Text size="sm">{props.unit.health} HP</Text>
              </Flex>
            </Group>
          </Grid.Col>
          <Grid.Col span={7}>
            <Flex gap="4" justify="flex-end" align="center" direction="row" wrap="wrap">
              {/* <Rating defaultValue={0} size="sm" count={3} /> */}
              {props.modifierScope === "defensive" ? (
                props.onFogOfWarChange && (
                  <Tooltip label={t("dpsCompareUi.target.fogOfWar")}>
                    <ActionIcon
                      size="lg"
                      variant={props.fogOfWar ? "default" : "transparent"}
                      aria-label={t("dpsCompareUi.target.fogOfWar")}
                      aria-pressed={Boolean(props.fogOfWar)}
                      data-testid="scatter-fog-of-war-toggle"
                      onClick={() => props.onFogOfWarChange?.(!props.fogOfWar)}
                    >
                      <Image
                        src={getIconsPathOnCDN("icons/common/hide_password.png")}
                        alt=""
                        h={27}
                        w={27}
                      />
                    </ActionIcon>
                  </Tooltip>
                )
              ) : (
                <Tooltip label="Moving">
                  <ActionIcon
                    size="lg"
                    onClick={onMovingChange}
                    variant={props.unit.is_moving ? "default" : "transparent"}
                  >
                    <Image
                      src="/icons/common/abilities/tactical_movement_riflemen_us.png"
                      alt="Moving"
                      h={27}
                      w={27}
                    />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Heavy Cover">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "heavy" ? "default" : "transparent"}
                  onClick={() => onCoverChange("heavy")}
                >
                  <Image src="/icons/common/cover/heavy.png" alt="Heavy Cover" h={32} w={32} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Light Cover">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "light" ? "default" : "transparent"}
                  onClick={() => onCoverChange("light")}
                >
                  <Image src="/icons/common/cover/light.png" alt="Light Cover" h={32} w={32} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Negative Cover">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "negative" ? "default" : "transparent"}
                  onClick={() => onCoverChange("negative")}
                >
                  <Image
                    src="/icons/common/cover/negative.png"
                    alt="Negative Cover"
                    w={32}
                    h={32}
                  />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Garrison">
                <ActionIcon
                  size="lg"
                  variant={props.unit.cover == "garrison" ? "default" : "transparent"}
                  onClick={() => onCoverChange("garrison")}
                >
                  <Image src="/icons/common/units/garrisoned.png" alt="Garrison" h={31} w={27} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Custom Configuration">
                <ActionIcon
                  size="lg"
                  onClick={onCustomConfigOpen}
                  color="gray"
                  variant={
                    selectedVeterancy > 0 ||
                    (props.unit.custom_modifiers &&
                      Object.values(props.unit.custom_modifiers).some((mod) => mod.enabled))
                      ? "default"
                      : "transparent"
                  }
                >
                  <IconSettings size={24} />
                </ActionIcon>
              </Tooltip>
            </Flex>
          </Grid.Col>
        </Grid>
        {maxVeterancy > 0 && (
          <Group gap={2} wrap="nowrap" justify="flex-start" data-testid="dps-veterancy-control">
            {Array.from({ length: maxVeterancy }, (_, index) => {
              const level = index + 1;
              const active = level <= selectedVeterancy;
              // Hover shows this rank's raw modifier values; selecting it applies every preceding rank.
              const rankModifiers = veterancyRanks[index]?.modifiers ?? [];
              return (
                <Tooltip
                  key={level}
                  disabled={rankModifiers.length === 0}
                  position="top"
                  withArrow
                  multiline
                  w={320}
                  events={{ hover: true, focus: true, touch: true }}
                  label={
                    <Stack gap={4}>
                      {rankModifiers.map(({ id, value }, modifierIndex) => (
                        <Group
                          key={`${id}-${modifierIndex}`}
                          gap="sm"
                          wrap="nowrap"
                          justify="space-between"
                        >
                          <Text size="xs" style={{ overflowWrap: "anywhere" }}>
                            {humanizeVeterancyModifierId(id)}
                          </Text>
                          <Text size="xs" fw={600} style={{ flexShrink: 0 }}>
                            {value}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  }
                >
                  <UnstyledButton
                    type="button"
                    onClick={() => onVeterancyChange(level)}
                    aria-label={`★ ${active && level === selectedVeterancy ? 0 : level}`}
                    aria-pressed={level === selectedVeterancy}
                    style={{ display: "inline-flex", alignItems: "center", padding: 2 }}
                  >
                    <Image
                      src={active ? vetStarIconPath : vetStarEmptyIconPath}
                      alt=""
                      aria-hidden
                      w={19}
                      h={19}
                      fit="contain"
                    />
                  </UnstyledButton>
                </Tooltip>
              );
            })}
          </Group>
        )}
        {(showHeavyBarrels || showDakCoax) && (
          <Group gap="xs" wrap="wrap" data-testid="vehicle-mg-upgrades">
            {showHeavyBarrels && (
              <Tooltip label={t("dpsCompareUi.upgrades.heavyBarrelsTip")}>
                <Button
                  size="compact-xs"
                  variant={props.unit.heavyBarrelsEnabled ? "filled" : "default"}
                  color="blue"
                  aria-pressed={Boolean(props.unit.heavyBarrelsEnabled)}
                  data-testid="vehicle-heavy-barrels"
                  onClick={() => onVehicleUpgradeToggle("heavyBarrelsEnabled")}
                >
                  {t("dpsCompareUi.upgrades.heavyBarrels")}
                </Button>
              </Tooltip>
            )}
            {showDakCoax && (
              <Tooltip label={t("dpsCompareUi.upgrades.armoredSupportTip")}>
                <Button
                  size="compact-xs"
                  variant={props.unit.dakCoaxUpgradeEnabled ? "filled" : "default"}
                  color="blue"
                  aria-pressed={Boolean(props.unit.dakCoaxUpgradeEnabled)}
                  data-testid="vehicle-dak-coax-upgrade"
                  onClick={() => onVehicleUpgradeToggle("dakCoaxUpgradeEnabled")}
                >
                  {t("dpsCompareUi.upgrades.armoredSupport")}
                </Button>
              </Tooltip>
            )}
          </Group>
        )}
        <WeaponSearch searchData={weaponList} onSelect={onAddWeapon} />

        <Group gap="xs">{components}</Group>
      </Stack>
      {/* </Box> */}
      <CustomConfigModal
        opened={customConfigOpened}
        onClose={() => setCustomConfigOpened(false)}
        customModifiers={props.unit.custom_modifiers || createDefaultCustomModifiers()}
        onModifiersChange={onCustomConfigChange}
        unit={props.unit}
        modifierScope={props.modifierScope}
        unitName={
          props.unit.screen_name !== "No text found" ? props.unit.screen_name : props.unit.id
        }
        unitColor={props.index === 0 ? "blue" : "red"}
      />
    </>
  );
};
