import { NextPage } from "next";
import { DpsChart } from "../components/unitStats/DpsChart";
import {
  getWeaponStats,
  setWeaponStats,
  WeaponStats,
  WeaponType,
} from "../src/unitStats/mappingWeapon";

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
  squadData: any;
  generalInfo: any;
  properties: any;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitPage: NextPage<UnitCardProps> = ({ weaponData }) => {
  // const UnitPage: NextPage = () => {
  //const [searchValue, onSearchChange] = useState('');
  setWeaponStats(weaponData);
  //<div style={{"height": "800px"}}>
  return (
    <div>
      <DpsChart></DpsChart>
    </div>
  );
};

export const getStaticProps = async () => {
  // relative path are not supported as far as I understood
  //const myReq = await fetch("http://localhost:3000/game_stats/weapons.json");
  const myReqWeapon = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/weapon.json",
  );

  const myReqSbps = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/sbps.json",
  );

  const myReqEbps = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/ebps.json",
  );

  const myReqLocstring = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/locstring.json",
  );

  // Map localization
  const locstringJSON = await myReqLocstring.json();
  unitStatsLocString = [];
  for (const loc in locstringJSON)
    unitStatsLocString.push({ id: parseInt(loc), value: locstringJSON[loc] });

  const weapon = await myReqWeapon.json();

  // map Weapon Data at built time
  const weaponData = getWeaponStats(weapon);

  return { props: { weaponData: weaponData } };
};

export default UnitPage;
