import Image from "next/image";

const CountryFlag = ({ countryCode }: { countryCode: string }) => {
  return (
    <Image
      src={`/flags/4x3/${countryCode}.svg`}
      alt={countryCode}
      width={20}
      height={18}
      loading="lazy"
    />
  );
};

export default CountryFlag;
