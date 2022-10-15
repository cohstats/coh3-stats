import React, { useEffect, useState } from "react";

const Leaderboards: React.FC = () => {
  const [data, setData] = useState("");

  useEffect(() => {
    setData("something");
  }, []);

  return <>{data}</>;
};

export default Leaderboards;
