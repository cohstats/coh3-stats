import React from "react";
import { Box, Center, Text, Space, useMantineTheme, MantineColor } from "@mantine/core";
import { DpsUnitCustomizing } from "../dpsUnitCustomizing";
import { CustomizableUnit } from "../../../../src/unitStats/dpsCommon";
import { EbpsType } from "../../../../src/unitStats/mappingEbps";
import { WeaponType } from "../../../../src/unitStats/mappingWeapon";

interface UnitCustomizationPanelProps {
  unit: CustomizableUnit | undefined;
  position: number;
  patchVersion: string;
  ebpsData: EbpsType[];
  weaponData: WeaponType[];
  allowAllWeapons: boolean;
  onSquadConfigChange: () => void;
  borderColor: MantineColor;
}

export const UnitCustomizationPanel: React.FC<UnitCustomizationPanelProps> = ({
  unit,
  position,
  patchVersion,
  ebpsData,
  weaponData,
  allowAllWeapons,
  onSquadConfigChange,
  borderColor,
}) => {
  const theme = useMantineTheme();

  const boxStyle = {
    borderRadius: "var(--mantine-radius-md)",
    border: `solid 2px ${theme.colors[borderColor][5]}`,
    backgroundColor: `light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))`,
    textAlign: "left" as const,
    padding: "var(--mantine-spacing-xs)",
  };

  return (
    <>
      <Space h="sm" />
      <div style={{ minHeight: 242 }}>
        {!unit && (
          <Center h={200}>
            <Text c="dimmed" size="sm">
              Please select a unit
            </Text>
          </Center>
        )}
        {unit && (
          <Box style={boxStyle}>
            <DpsUnitCustomizing
              key={unit.id + "." + position + "." + patchVersion}
              unit={unit}
              onChange={onSquadConfigChange}
              index={position}
              ebps={ebpsData}
              weapons={weaponData}
              allowAllWeapons={allowAllWeapons}
            />
          </Box>
        )}
      </div>
    </>
  );
};
