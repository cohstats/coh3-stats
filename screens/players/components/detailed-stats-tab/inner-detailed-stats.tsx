import { WinLossPairType } from "../../../../src/coh3/coh3-types";
import { FactionVsFactionCard } from "../../../../components/charts/card-factions-heatmap";
import { AnalysisObjectType } from "../../../../src/analysis-types";

const InnerDetailedStats = ({
  stats,
}: {
  stats: {
    w: number; // wins
    l: number; // losses
    gameTime: number; // play time in seconds
    gameTimeSpread: Record<number, WinLossPairType>; // play time in seconds
    factionMatrix: Record<string, { wins: number; losses: number }>;
    maps: Record<string, WinLossPairType>;
    counters: Record<string, number>;
  } | null;
}) => {
  console.log(stats);

  return (
    <>
      {JSON.stringify(stats)}
      <FactionVsFactionCard
        data={(stats as unknown as AnalysisObjectType) || {}}
        title={"Faction matrix"}
      />
    </>
  );
};

export default InnerDetailedStats;
