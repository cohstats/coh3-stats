import React from "react";
import Image from "next/image";
import { IconButton } from "../icon-button/icon-button";
import config from "../../config";

export const Donate: React.FC = () => (
  <a
    href={config.DONATION_LINK}
    target="_blank"
    rel="noopener noreferrer"
    title={"Link to our donation pages."}
  >
    <IconButton label="Donate">
      <Image
        src="/kofi_s_logo_nolabel.webp"
        width={22}
        height={22}
        alt={"donate button"}
        unoptimized
      />
    </IconButton>
  </a>
);
