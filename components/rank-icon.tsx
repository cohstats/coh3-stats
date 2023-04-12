import Image from "next/image";
import { Tooltip } from "@mantine/core";

type Props = {
  size: number;
  race: string;
  rank: number;
};
const RankIcon = ({ size, race, rank }: Props) => {
  return (
    <>
      <Tooltip label={"Level " + rank}>
        <Image
          src={"/icons/ranks/" + race + "/rank_" + rank + ".png"}
          width={size}
          height={size}
          alt={"rank_" + race + "_" + rank}
          loading="lazy"
        />
      </Tooltip>
    </>
  );
};

export default RankIcon;
