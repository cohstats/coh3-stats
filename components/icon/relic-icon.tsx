import relic_icon from "../../public/icons/general/relic_icon.png";
import Image from "next/image";

const RelicIcon = ({ size = 20 }: { size?: number }) => {
  return <Image src={relic_icon} alt={`$Relic icon`} width={size} height={size} unoptimized />;
};

export default RelicIcon;
