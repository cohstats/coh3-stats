import Image from "next/image";

import { raceType } from "../src/coh3/coh3-types";
// This is not something we want to do with all images
// but these icons are used everywhere, so we can bake them into our app
import americanIcon from "../public/icons/general/american.png";
import germanIcon from "../public/icons/general/german.png";
import britishIcon from "../public/icons/general/british.png";
import dakIcon from "../public/icons/general/dak.png";

const FactionIcon = ({ name, width }: { name: raceType; width: number }) => {
  let icon = americanIcon;

  switch (name) {
    case "american":
      icon = americanIcon;
      break;
    case "british":
      icon = britishIcon;
      break;
    case "german":
      icon = germanIcon;
      break;
    case "dak":
      icon = dakIcon;
  }

  return (
    <Image src={icon} alt={`${name} faction icon`} width={width} height={width} unoptimized />
  );
};

export default FactionIcon;
