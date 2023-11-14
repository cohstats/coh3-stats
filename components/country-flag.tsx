import Image from "next/image";

const CountryFlag = ({
  countryCode,
  size = "md",
}: {
  countryCode: string;
  size?: "md" | "sm" | "xs";
}) => {
  let width = 20;
  let height = 18;
  if (size === "sm") {
    width = 18;
    height = 16;
  }
  if (size === "xs") {
    width = 16;
    height = 14;
  }

  // https://www.npmjs.com/package/flag-icons
  const src = countryCode
    ? `https://cdnjs.cloudflare.com/ajax/libs/flag-icons/6.15.0/flags/4x3/${countryCode.toLowerCase()}.svg`
    : `/flags/4x3/xx.svg`;

  return <Image src={src} alt={countryCode} width={width} height={height} loading="lazy" />;
};

export default CountryFlag;
