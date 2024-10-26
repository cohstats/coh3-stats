import Image from "next/image";

const CountryFlag = ({
  countryCode,
  size = "md",
  width,
  height,
}: {
  countryCode?: string;
  size?: "md" | "sm" | "xs";
  width?: number;
  height?: number;
}) => {
  let internalWidth = width || 20;
  let internalHeight = height || 18;
  if (size === "sm") {
    internalWidth = 18;
    internalHeight = 16;
  }
  if (size === "xs") {
    internalWidth = 16;
    internalHeight = 14;
  }

  // https://www.npmjs.com/package/flag-icons
  const src = countryCode
    ? `https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/4x3/${countryCode.toLowerCase()}.svg`
    : `/flags/4x3/xx.svg`;

  return (
    <Image
      src={src}
      alt={countryCode || ""}
      width={internalWidth}
      height={internalHeight}
      loading="lazy"
    />
  );
};

export default CountryFlag;
