import React, { useEffect, useState } from "react";

const Leaderboards: React.FC = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    (async () => {
      try {
        const response = await fetch(
          `https://us-east4-coh2-ladders-prod.cloudfunctions.net/getCOHLaddersHttp?leaderBoardID=4&start=0`,
        );
        const finalData = await response.json();
        console.log(finalData);
        setData(finalData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <>
      loading: {JSON.stringify(isLoading)} <br /> DATA: {JSON.stringify(data)}
    </>
  );
};

export default Leaderboards;
