import React from "react";
import Image from "next/image";
import { IconButton } from "../IconButton/IconButton";
import config from "../../config";

export const Donate: React.FC = () => (
  <>
    <IconButton label="Donate">
      <a href={config.DonationLink} target="_blank" rel="noopener noreferrer">
        <Image src="/kofi_s_logo_nolabel.webp" width={22} height={22} alt={"donate button"} />
      </a>
    </IconButton>
  </>
);
