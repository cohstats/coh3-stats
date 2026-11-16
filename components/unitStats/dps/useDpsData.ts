import { useCallback, useEffect, useState } from "react";
import { fetchDpsData } from "../../../src/unitStats/dpsData";
import type { DpsData } from "../../../src/unitStats/dpsData";

export const useDpsData = () => {
  const [data, setData] = useState<DpsData>();
  const [error, setError] = useState<Error>();
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setError(undefined);
    setAttempt((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let active = true;
    fetchDpsData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to load DPS data:", error);
        setError(error instanceof Error ? error : new Error("Failed to load DPS data"));
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  return { data, error, isLoading: !data && !error, retry };
};
