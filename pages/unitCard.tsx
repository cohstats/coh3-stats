import { NextPage } from "next";
import { DpsChart } from "../components/unitStats/dpsChart";
import { ebpsStats, EbpsType, getEbpsStats, setEbpsStats } from "../src/unitStats/mappingEbps";
import { getSbpsStats, sbpsStats, SbpsType, setSbpsStats } from "../src/unitStats/mappingSbps";
import {
  getWeaponStats,
  setWeaponStats,
  WeaponStats,
  WeaponType,
} from "../src/unitStats/mappingWeapon";
import {
  getUpgradesStats,
  setUpgradesStats,
  upgradesStats,
  UpgradesType,
} from "../src/unitStats/mappingUpgrades";
import { fetchLocstring, setLocstring, unitStatsLocString } from "../src/unitStats/locstring";
import { getMappings } from "../src/unitStats/mappings";

interface UnitCardProps {
  weaponData: WeaponType[];
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  upgradesData: UpgradesType[];
  locstring: any;
  generalInfo: any;
  properties: any;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitPage: NextPage<UnitCardProps> = ({
  weaponData,
  sbpsData,
  ebpsData,
  upgradesData,
  locstring,
}) => {
  // Save data again in global varible for clientMode
  if (!WeaponStats) setWeaponStats(weaponData);

  if (!ebpsStats) setEbpsStats(ebpsData);

  if (!upgradesStats) setUpgradesStats(upgradesData);

  if (!sbpsStats) setSbpsStats(sbpsData);

  if (!unitStatsLocString) setLocstring(locstring);

  const dbpsData = {
    weaponData: weaponData,
    sbpsData: sbpsData,
    ebpsData: ebpsData,
  };

  return (
    <div>
      <DpsChart {...dbpsData}></DpsChart>
    </div>
  );
};

export const getStaticProps = async () => {
  const { weaponData, sbpsData, upgradesData, ebpsData, locstring } = await getMappings();

  return {
    props: {
      weaponData: weaponData,
      sbpsData: sbpsData,
      ebpsData: ebpsData,
      upgradesData: upgradesData,
      locstring: locstring,
    },
  };
};

export default UnitPage;
