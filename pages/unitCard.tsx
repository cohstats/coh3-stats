import { NextPage } from "next";
import { DpsChart } from "../components/unitStats/dpsChart";
import { EbpsType, getEbpsStats, setEbpsStats } from "../src/unitStats/mappingEbps";
import { getSbpsStats, SbpsType, setSbpsStats } from "../src/unitStats/mappingSbps";
import {
  getWeaponStats,
  setWeaponStats,
  WeaponStats,
  WeaponType,
} from "../src/unitStats/mappingWeapon";
import {
  getUpgradesStats,
  setUpgradesStats,
  UpgradesType,
} from "../src/unitStats/mappingUpgrades";
import { fetchLocstring, setLocstring, unitStatsLocString } from "../src/unitStats/locstring";

interface UnitCardProps {
  weaponData: WeaponType[];
  spbsData: SbpsType[];
  epbsData: EbpsType[];
  upgradesData: UpgradesType[];
  locstring: any;
  generalInfo: any;
  properties: any;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitPage: NextPage<UnitCardProps> = ({
  weaponData,
  spbsData,
  epbsData,
  upgradesData,
  locstring,
}) => {
  // Save data again in global varible for clientMode
  if (!WeaponStats) setWeaponStats(weaponData);

  if (!epbsData) setEbpsStats(epbsData);

  if (!upgradesData) setUpgradesStats(upgradesData);

  if (!spbsData) setSbpsStats(spbsData);

  if (!unitStatsLocString) setLocstring(locstring);

  return (
    <div>
      <DpsChart></DpsChart>
    </div>
  );
};

export const getStaticProps = async () => {
  const locstring = await fetchLocstring();

  // map Data at built time
  const weaponData = await getWeaponStats();

  // map Data at built time
  const ebpsData = await getEbpsStats();

  // map Data at built time
  const sbpsData = await getSbpsStats();

  // map Data at built time
  const upgradesData = await getUpgradesStats();

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
