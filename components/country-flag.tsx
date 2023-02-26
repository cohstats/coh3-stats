import { Image } from "@mantine/core";

const CountryFlag = ({ countryCode }: { countryCode: string }) => {
  return <Image src={`/flags/4x3/${countryCode}.svg`} alt={countryCode} width={20} />;
};

export default CountryFlag;
