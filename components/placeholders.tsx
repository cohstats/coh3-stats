import React, { useState } from "react";
import Image, { ImageProps, StaticImageData } from "next/image";
import symbolPlaceholder from "../public/icons/common/units/symbols/placeholder_symbol.png";
import iconPlaceholder from "../public/icons/common/units/icons/placeholder_unit_icon.png";
import { exportedIconPath } from "../src/utils";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string | StaticImageData;
}

const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...rest}
      alt={`Image for ${exportedIconPath(imgSrc)}}`}
      src={exportedIconPath(imgSrc)}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default ImageWithFallback;
export { symbolPlaceholder, iconPlaceholder };
