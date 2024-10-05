import { ProcessedMatch } from "../../src/coh3/coh3-types";

const MatchDetail = ({ matchData }: { matchData: ProcessedMatch }) => {
  return (
    <>
      <h1>Match Details</h1>
      <pre>{JSON.stringify(matchData, null, 2)}</pre>
    </>
  );
};

export default MatchDetail;
