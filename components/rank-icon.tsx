import Image from "next/image";
import { Tooltip, Button } from "@mantine/core";

type Props = {
  width: number;
  height: number;
  race: string;
  rank: number;
};
const RankIcon = ({ height, width, race, rank }: Props) => {
  return (
    <>
      <Tooltip label={"Level " + rank}>
        <Image
          style={{}}
          src={"/ranks/" + race + "/rank_" + rank + ".png"}
          width={width}
          height={height}
          alt={"rank_" + race + "_" + rank}
          loading="lazy"
        />
      </Tooltip>
    </>
  );
};

export default RankIcon;
