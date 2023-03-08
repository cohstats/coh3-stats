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

type Locstring = {
  id: number;
  value: string;
};

let unitStatsLocString: Locstring[];

export const resolveLocstring = (locstring: any) => {
  const numId = parseInt(locstring?.locstring?.value);

  let result = unitStatsLocString?.find((entry) => entry.id == numId)?.value;
  if (!result) result = "No text found.";

  return result;
};

interface UnitCardProps {
  weaponData: WeaponType[];
  spbsData: SbpsType[];
  epbsData: EbpsType[];
  upgradesData: UpgradesType[];
  generalInfo: any;
  properties: any;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitPage: NextPage<UnitCardProps> = ({ weaponData, spbsData, epbsData, upgradesData }) => {
  if (!WeaponStats)
    // Save data again in global varible for clientMode
    setWeaponStats(weaponData);

  if (!epbsData) setEbpsStats(epbsData);

  if (!upgradesData) setUpgradesStats(upgradesData);

  if (!spbsData) setSbpsStats(spbsData);

  return (
    <div>
      <DpsChart></DpsChart>
    </div>
  );
};

export const getStaticProps = async () => {
  //const weapon = await myReqWeapon.json();
  // map Data at built time
  const weaponData = await getWeaponStats();

  // map Data at built time
  const ebpsData = await getEbpsStats();

  // map Data at built time
  const sbpsData = await getSbpsStats();

  // map Data at built time
  const upgradesData = await getUpgradesStats();

  if (!unitStatsLocString) {
    const myReqLocstring = await fetch(
      "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/locstring.json",
    );

    // Map localization
    const locstringJSON = await myReqLocstring.json();
    unitStatsLocString = [];
    for (const loc in locstringJSON)
      unitStatsLocString.push({ id: parseInt(loc), value: locstringJSON[loc] });
  }

  return {
    props: {
      weaponData: weaponData,
      sbpsData: sbpsData,
      ebpsData: ebpsData,
      upgradesData: upgradesData,
    },
  };
};

export default UnitPage;
