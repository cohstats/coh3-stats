import Image from "next/image";
import { Tooltip } from "@mantine/core";
import { PlayerRanks } from "../src/coh3/coh3-data";

type Props = {
  size: number;
  rating: number;
  rank: number;
};

const RankIcon = ({ size, rank, rating }: Props) => {
  let foundRank = PlayerRanks.NO_RANK;

  if (!rank || rank <= 0) {
    // Do nothing.
  } else {
    // If rating is higher than 1600, take into account the rank.
    if (rating >= 1600) {
      const playerRank = Object.values(PlayerRanks).find((x) => x.rank >= rank);

      if (playerRank) {
        foundRank = playerRank;
      }
    } else {
      const playerRank = Object.values(PlayerRanks).find(
        (x) => x.min <= rating && rating <= x.max,
      );

      if (playerRank) {
        foundRank = playerRank;
      }
    }
  }

  return (
    <>
      <Tooltip label={foundRank.name}>
        <Image
          src={foundRank.url}
          width={size}
          height={size}
          alt={foundRank.name}
          loading="lazy"
        />
      </Tooltip>
    </>
  );
};

export default RankIcon;
