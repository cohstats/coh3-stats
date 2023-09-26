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

  return (
    <Image
      src={`/flags/4x3/${countryCode.toLowerCase() || "xx"}.svg`}
      alt={countryCode}
      width={width}
      height={height}
      loading="lazy"
    />
  );
};

export default CountryFlag;
