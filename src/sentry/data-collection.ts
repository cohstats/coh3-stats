// Sentry v11 replaced `sendDefaultPii` with `dataCollection` and made the defaults more permissive
// (user info, cookies, HTTP bodies, ... are collected when unset).
// This keeps the v10 default behaviour (`sendDefaultPii` off) we were running with.
// https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md#senddefaultpii-is-replaced-by-datacollection

import type * as Sentry from "@sentry/nextjs";

const piiDenyList = ["forwarded", "-ip", "remote-", "via", "-user"];

export const sentryDataCollection: NonNullable<
  Parameters<typeof Sentry.init>[0]
>["dataCollection"] = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: piiDenyList },
    response: { deny: piiDenyList },
  },
  httpBodies: [],
  urlQueryParams: { deny: piiDenyList },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
};
