import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { encodeSharedDpsSetup, type SharedDpsSetup } from "../../../src/unitStats/sharedDpsSetup";

/** Replace, rather than push, so editing a slider does not fill browser history. */
export const useSharedDpsUrl = (ready: boolean, setup: SharedDpsSetup) => {
  const router = useRouter();
  const lastWritten = useRef("");
  const serialized = JSON.stringify(setup);
  useEffect(() => {
    if (!ready || !router.isReady) return;
    const saved = JSON.parse(serialized) as SharedDpsSetup;
    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        const hash = `setup=${await encodeSharedDpsSetup(saved)}`;
        if (cancelled || lastWritten.current === hash || router.asPath?.split("#")[1] === hash)
          return;
        const query = { ...router.query };
        // Legacy unit-only links still load, but the full setup already holds these IDs.
        delete query.unit1;
        delete query.unit2;
        lastWritten.current = hash;
        await router.replace({ pathname: router.pathname, query, hash }, undefined, {
          shallow: true,
          scroll: false,
        });
      })().catch(() => {
        if (!cancelled) lastWritten.current = "";
      });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ready, router.isReady, serialized]);
};
