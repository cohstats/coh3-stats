import Image from "next/image";
import { Tooltip } from "@mantine/core";
import { calculatePlayerTier } from "../src/coh3/helpers";

type Props = {
  size: number;
  rating: number;
  rank: number;
};

const RankIcon = ({ size, rank, rating }: Props) => {
  const rankTier = calculatePlayerTier(rank, rating);

  return (
    <>
      <Tooltip label={rankTier.name}>
        <Image src={rankTier.url} width={size} height={size} alt={rankTier.name} loading="lazy" />
      </Tooltip>
    </>
  );
};

export default RankIcon;
