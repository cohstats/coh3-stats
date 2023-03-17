import React, { useState } from "react";
import Image, { ImageProps, StaticImageData } from "next/image";
import symbolPlaceholder from "../public/icons/common/units/symbols/placeholder_symbol.png";
import iconPlaceholder from "../public/icons/common/units/icons/placeholder_unit_icon.png";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string | StaticImageData;
}

const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { src, fallbackSrc, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...rest}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default ImageWithFallback;
export { symbolPlaceholder, iconPlaceholder };
