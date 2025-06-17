import Image from "next/image";

import { raceType } from "../src/coh3/coh3-types";
// This is not something we want to do with all images
// but these icons are used everywhere, so we can bake them into our app
import americanIcon from "../public/icons/general/american.webp";
import germanIcon from "../public/icons/general/german.webp";
import britishIcon from "../public/icons/general/british.webp";
import dakIcon from "../public/icons/general/dak.webp";
import React from "react";

const FactionIcon = ({
  name,
  width,
  style,
}: {
  name: raceType;
  width: number;
  style?: React.CSSProperties;
}) => {
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
    <Image
      src={icon}
      alt={`${name} faction icon`}
      width={width}
      height={width}
      style={style}
      unoptimized
    />
  );
};

export default FactionIcon;
