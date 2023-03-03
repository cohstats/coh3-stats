import { NextPage } from "next";
import ErrorCard from "../components/error-card";
import { getWeaponData, WeaponData } from "../src/unitStats/unitStatsUtils";
import { DpsChart } from "../components/units/DpsChart";

interface MyProps {
  dataString: string;
}

// Parameter in Curly brackets is destructuring for
// accessing attributes of Props Structure directly
const UnitPage: NextPage<MyProps> = ({ dataString }) => {
  //const [searchValue, onSearchChange] = useState('');

  //var str:string = dataString!;
  const obj = JSON.parse(dataString);

  var weaponSet = getWeaponData(obj);

  var weaponData: any[] = [];

  weaponSet.forEach((item: any) => {
    if (
      item.weapon_bag.default_attack_type === "small_arms" &&
      (item.weapon_bag.weapon_class === "rifle" ||
        item.weapon_bag.weapon_class === "smg" ||
        item.weapon_bag.weapon_class === "lmg" ||
        item.weapon_bag.weapon_class === "hmg")
    ) {
      var weapon_icon = "";
      switch (item.weapon_bag.weapon_class) {
        case "smg":
          weapon_icon = "m1_thompson_sub_machine_gun.png";
          break;
        case "lmg":
          weapon_icon = "weapon_lmg_mg34.png";
          break;
        case "hmg":
          weapon_icon = "hmg_mg42_ger.png";
          break;
        default:
          weapon_icon = "weapon_dp_28_lmg.png";
          break;
      }

      weaponData.push({
        //image: item.icon_name,
        image: "/game_stats/weapon_icons/" + weapon_icon,
        label: item.id,
        value: item.id,
        data: item.weapon_bag,
        description: item.ui_name || "No Description Available",
      });
    }
    //weaponData.
  });

  var weaponMap = { root: weaponData };

  //<div style={{"height": "800px"}}>
  return (
    <div>
      <DpsChart searchData={weaponData}></DpsChart>
    </div>
  );
};

UnitPage.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers["user-agent"] : navigator.userAgent;

  // relative path are not supported as far as I understood
  const myReq = await fetch("http://localhost:3000/game_stats/weapons.json");
  const data = await myReq.json();
  const weaponBag = data.weapon_bag;
  const dataString = JSON.stringify(data);
  return { dataString };
};

export default UnitPage;
