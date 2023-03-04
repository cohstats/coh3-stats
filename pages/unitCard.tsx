import { NextPage } from "next";
import ErrorCard from "../components/error-card";
import { getWeaponData, WeaponData } from "../src/unitStats/WeaponLib";
import { DpsChart } from "../components/units/DpsChart";

interface UnitCardProps {
  weaponData: WeaponData[];
  squadData: any;
  generalInfo: any;
  properties: any;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitPage: NextPage<UnitCardProps> = ({ weaponData }) => {
  //const [searchValue, onSearchChange] = useState('');

  //<div style={{"height": "800px"}}>
  return (
    <div>
      <DpsChart searchData={weaponData}></DpsChart>
    </div>
  );
};

export const getStaticProps = async () => {
  // relative path are not supported as far as I understood
  //const myReq = await fetch("http://localhost:3000/game_stats/weapons.json");
  const myReq = await fetch(
    "https://raw.githubusercontent.com/cohstats/coh3-data/xml-data/scripts/xml-to-json/exported/weapon/weapon.json",
  );

  const data = await myReq.json();

  // map Weapon Data at built time
  var weaponData = getWeaponData(data);

  return { props: { weaponData: weaponData } };
};

export default UnitPage;
