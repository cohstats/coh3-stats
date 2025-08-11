import React from "react";
import { Box, Center, Text, Space } from "@mantine/core";
import { DpsUnitCustomizing } from "../dpsUnitCustomizing";
import { CustomizableUnit } from "../../../../src/unitStats/dpsCommon";
import { EbpsType } from "../../../../src/unitStats/mappingEbps";
import { WeaponType } from "../../../../src/unitStats/mappingWeapon";
import classes from "../../DPSChart.module.css";

interface UnitCustomizationPanelProps {
  unit: CustomizableUnit | undefined;
  position: number;
  patchVersion: string;
  ebpsData: EbpsType[];
  weaponData: WeaponType[];
  allowAllWeapons: boolean;
  onSquadConfigChange: () => void;
}

export const UnitCustomizationPanel: React.FC<UnitCustomizationPanelProps> = ({
  unit,
  position,
  patchVersion,
  ebpsData,
  weaponData,
  allowAllWeapons,
  onSquadConfigChange,
}) => {
  const boxClassName = position === 0 ? classes.unitBoxLeft : classes.unitBoxRight;

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
          <Box className={boxClassName}>
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
