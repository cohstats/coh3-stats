import React from 'react';
import Image from 'next/image';
import { IconButton } from '../IconButton/IconButton';

export const Donate: React.FC = () => (
  <>
    <IconButton label="Donate">
      <Image src="/kofi_s_logo_nolabel.webp" width={22} height={22} />
    </IconButton>
  </>
);
