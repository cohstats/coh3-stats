import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { encodeSharedDpsSetup, type SharedDpsSetup } from "../../../src/unitStats/sharedDpsSetup";

type UrlWriteRequest = { reconcile: (settledHash: string | undefined) => void };

/** Replace, rather than push, so editing a slider does not fill browser history. */
export const useSharedDpsUrl = (ready: boolean, setup: SharedDpsSetup) => {
  const router = useRouter();
  const latestWrite = useRef<UrlWriteRequest | undefined>(undefined);
  const pendingWrite = useRef<UrlWriteRequest | undefined>(undefined);
  const serialized = JSON.stringify(setup);
  useEffect(() => {
    if (!ready || !router.isReady) return;
    const saved = JSON.parse(serialized) as SharedDpsSetup;
    let cancelled = false;
    let hash: string | undefined;
    let knownHash: string | undefined = router.asPath?.split("#")[1] ?? "";
    const request: UrlWriteRequest = {
      reconcile: (settledHash) => {
        knownHash = settledHash;
        sync();
      },
    };
    latestWrite.current = request;

    function sync() {
      if (cancelled || hash === undefined || pendingWrite.current || hash === knownHash) return;
      const targetHash = hash;
      pendingWrite.current = request;
      void (async () => {
        let settledHash: string | undefined;
        const query = { ...router.query };
        // Legacy unit-only links still load, but the full setup already holds these IDs.
        delete query.unit1;
        delete query.unit2;
        try {
          const completed = await router.replace(
            { pathname: router.pathname, query, hash: targetHash },
            undefined,
            { shallow: true, scroll: false },
          );
          if (completed) settledHash = targetHash;
        } catch {
          // Failed or cancelled navigations leave later edits free to retry.
        } finally {
          if (pendingWrite.current === request) pendingWrite.current = undefined;
          // Wake the latest setup even if it is still being debounced or compressed.
          const latest = latestWrite.current;
          if (latest && latest !== request) latest.reconcile(settledHash);
        }
      })();
    }

    const timer = setTimeout(() => {
      void (async () => {
        const encoded = await encodeSharedDpsSetup(saved);
        if (cancelled) return;
        hash = encoded ? `setup=${encoded}` : "";
        sync();
      })().catch(() => {});
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (latestWrite.current === request) latestWrite.current = undefined;
    };
  }, [ready, router.isReady, serialized]);
};
