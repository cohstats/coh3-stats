/**
 * Standalone test page for the Steam login implemented on the BE
 * (coh3-stats-be `functions/src/sharedAPI/auth.ts`).
 *
 * Everything lives in this single file on purpose - this is a throwaway harness to prove the
 * flow works end to end. Once we are happy with it, the API calls move to `src/apis/` and the
 * token handling into a proper auth provider / hook.
 *
 * The flow:
 *  1. "Login with Steam" redirects to Steam OpenID with `openid.return_to` pointing back here
 *  2. Steam redirects back with `openid.*` query params, we POST them to `/auth/login`
 *  3. The BE verifies them against Steam, resolves the COH3 profile ID and returns the user
 *     together with an access token (1 hour) and a refresh token (90 days)
 *  4. Reading data - `GET /auth/me` with `Authorization: Bearer <accessToken>`
 *  5. `POST /auth/refresh` swaps the refresh token for a fresh access token
 *  6. `POST /auth/logout` deletes the session on the BE - the refresh token dies immediately,
 *     the access token keeps working until it expires (no DB read on the hot path)
 */

import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Container,
  Divider,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconBrandSteam, IconCheck, IconLogout, IconRefresh, IconX } from "@tabler/icons-react";
import config from "../../config";

/**
 * The `openid.*` params Steam sends back to `return_to`. They are forwarded to the BE as is
 * (flat keys, not nested) - that is what the BE re-signs against Steam.
 */
interface SteamOpenIDResponse {
  "openid.ns": string;
  "openid.mode": string;
  "openid.op_endpoint": string;
  "openid.claimed_id": string;
  "openid.identity": string;
  "openid.return_to": string;
  "openid.response_nonce": string;
  "openid.assoc_handle": string;
  "openid.signed": string;
  "openid.sig": string;
  [key: string]: string;
}

interface AuthUser {
  steamID: string;
  profileID: string;
  createdAt: number;
  lastLoginAt: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  /** access token lifetime in seconds */
  expiresIn: number;
  /** refresh token lifetime in seconds */
  refreshExpiresIn: number;
}

/** What we keep in localStorage - the tokens plus when they stop being usable. */
interface StoredSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** ms epoch */
  accessTokenExpiresAt: number;
  /** ms epoch */
  refreshTokenExpiresAt: number;
}

type ApiTarget = "proxy" | "emulator";

const STORAGE_KEY = "coh3stats-test-auth-session";

const FIREBASE_PROJECT_ID = config.getFirebaseConfig().projectId || "coh3-stats-prod";

const API_BASES: Record<ApiTarget, string> = {
  proxy: `${config.BASE_CLOUD_FUNCTIONS_PROXY_URL}/sharedAPIGen2Http`,
  emulator: `http://127.0.0.1:5001/${FIREBASE_PROJECT_ID}/us-east4/sharedAPIGen2Http`,
};

/**
 * Steam OpenID 2.0 "checkid_setup" URL. `realm` has to be a prefix of `returnUrl`, otherwise
 * Steam refuses the request.
 */
const getSteamLoginUrl = (returnUrl: string, realm: string) => {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": returnUrl,
    "openid.realm": realm,
    "openid.mode": "checkid_setup",
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`;
};

interface ApiResult {
  status: number;
  ok: boolean;
  body: any;
}

const apiCall = async (url: string, init: RequestInit): Promise<ApiResult> => {
  const response = await fetch(url, init);

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // Nothing we can do - a non JSON body is a failure on its own.
  }

  return { status: response.status, ok: response.ok, body };
};

const loadStoredSession = (): StoredSession | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
};

const sessionFromTokens = (user: AuthUser, tokens: TokenPair): StoredSession => ({
  user,
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  tokenType: tokens.tokenType,
  accessTokenExpiresAt: Date.now() + tokens.expiresIn * 1000,
  refreshTokenExpiresAt: Date.now() + tokens.refreshExpiresIn * 1000,
});

const shortToken = (token: string) => `${token.slice(0, 24)}...${token.slice(-12)}`;

const formatTimestamp = (ms: number) => new Date(ms).toISOString();

const formatRemaining = (expiresAt: number) => {
  const seconds = Math.round((expiresAt - Date.now()) / 1000);
  if (seconds <= 0) return "expired";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

type LogLevel = "info" | "ok" | "error";

interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  message: string;
}

const LOG_COLORS: Record<LogLevel, string> = {
  info: "gray",
  ok: "green",
  error: "red",
};

const LoginTestPage: NextPage = () => {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [apiTarget, setApiTarget] = useState<ApiTarget>("proxy");
  const [session, setSession] = useState<StoredSession | null>(null);
  const [steamResponse, setSteamResponse] = useState<SteamOpenIDResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ApiResult | null>(null);
  const [log, setLog] = useState<Array<LogEntry>>([]);
  // Steam sends us back here on every reload of the callback URL - only exchange the params once.
  const exchangedRef = useRef(false);
  const logIdRef = useRef(0);

  const apiBase = API_BASES[apiTarget];

  const addLog = useCallback((level: LogLevel, message: string, payload?: unknown) => {
    logIdRef.current += 1;
    // The payload goes to the console - the on page log stays readable.
    if (payload !== undefined) {
      console.log(`[login-test] ${message}`, payload);
    }
    setLog((entries) => [
      {
        id: logIdRef.current,
        time: new Date().toISOString().slice(11, 23),
        level,
        message,
      },
      ...entries,
    ]);
  }, []);

  const persistSession = useCallback((next: StoredSession | null) => {
    setSession(next);
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Restore whatever we had before the reload / the Steam round trip.
  useEffect(() => {
    setMounted(true);
    const stored = loadStoredSession();
    if (stored) {
      setSession(stored);
      addLog("info", `Restored session from localStorage for steamID ${stored.user.steamID}`);
    }
  }, [addLog]);

  // Re-render once a second so the token countdowns tick.
  const hasSession = Boolean(session);
  useEffect(() => {
    if (!hasSession) return;
    const interval = setInterval(
      () => setSession((current) => (current ? { ...current } : null)),
      1000,
    );
    return () => clearInterval(interval);
  }, [hasSession]);

  const exchangeOpenIDResponse = useCallback(
    async (openIDResponse: SteamOpenIDResponse) => {
      setPendingAction("login");
      addLog("info", "POST /auth/login - exchanging the Steam OpenID response for tokens");

      try {
        const result = await apiCall(`${apiBase}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Flat `openid.*` keys - the BE re-signs exactly what Steam sent us.
          body: JSON.stringify(openIDResponse),
        });

        setLastResponse(result);

        if (result.ok && result.body?.success) {
          const stored = sessionFromTokens(
            result.body.user as AuthUser,
            result.body as TokenPair,
          );
          persistSession(stored);
          addLog(
            "ok",
            `Logged in as steamID ${stored.user.steamID} / profileID ${stored.user.profileID}`,
            result.body.user,
          );
          // Drop the openid.* params from the URL so a reload does not look like a new callback.
          router.replace("/tests/login", undefined, { shallow: true });
        } else {
          addLog(
            "error",
            `Login failed (${result.status}) - ${result.body?.code || "UNKNOWN"}: ${
              result.body?.message || result.body?.error
            }`,
            result.body,
          );
        }
      } catch (error) {
        addLog("error", `Login request threw: ${error instanceof Error ? error.message : error}`);
      } finally {
        setPendingAction(null);
      }
    },
    [addLog, apiBase, persistSession, router],
  );

  // Pick up the Steam callback params and immediately exchange them for tokens.
  useEffect(() => {
    if (!router.isReady || exchangedRef.current) return;
    if (router.query["openid.mode"] !== "id_res") return;

    const openIDResponse = {} as SteamOpenIDResponse;
    Object.entries(router.query).forEach(([key, value]) => {
      if (key.startsWith("openid.") && typeof value === "string") {
        openIDResponse[key] = value;
      }
    });

    exchangedRef.current = true;
    setSteamResponse(openIDResponse);
    addLog("info", "Steam redirected back with an OpenID response", openIDResponse);
    void exchangeOpenIDResponse(openIDResponse);
  }, [addLog, exchangeOpenIDResponse, router.isReady, router.query]);

  const handleSteamLogin = () => {
    const returnUrl = `${window.location.origin}${window.location.pathname}`;
    const steamLoginUrl = getSteamLoginUrl(returnUrl, window.location.origin);
    addLog("info", `Redirecting to Steam with return_to ${returnUrl}`);
    window.location.href = steamLoginUrl;
  };

  /** POST /auth/refresh - returns the new session or null when it is gone on the BE. */
  const refreshAccessToken = useCallback(
    async (current: StoredSession): Promise<StoredSession | null> => {
      addLog("info", "POST /auth/refresh - exchanging the refresh token for a new access token");

      const result = await apiCall(`${apiBase}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });

      setLastResponse(result);

      if (!result.ok || !result.body?.success) {
        addLog(
          "error",
          `Refresh failed (${result.status}) - ${result.body?.code || "UNKNOWN"}: ${
            result.body?.message || result.body?.error
          }`,
          result.body,
        );
        return null;
      }

      const next = sessionFromTokens(current.user, result.body as TokenPair);
      persistSession(next);
      addLog("ok", `New access token, valid for ${result.body.expiresIn}s`);
      return next;
    },
    [addLog, apiBase, persistSession],
  );

  const handleRefresh = async () => {
    if (!session) return;
    setPendingAction("refresh");
    try {
      await refreshAccessToken(session);
    } catch (error) {
      addLog("error", `Refresh request threw: ${error instanceof Error ? error.message : error}`);
    } finally {
      setPendingAction(null);
    }
  };

  /**
   * GET /auth/me - the "reading the data" part of the test. With `autoRefresh` it retries once
   * after refreshing, which is how the real app should handle an expired access token.
   */
  const readMe = async (autoRefresh: boolean) => {
    if (!session) return;
    setPendingAction(autoRefresh ? "me-auto" : "me");

    try {
      const call = (accessToken: string) =>
        apiCall(`${apiBase}/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

      addLog("info", "GET /auth/me with the access token");
      let result = await call(session.accessToken);
      setLastResponse(result);

      if (result.status === 401 && result.body?.code === "TOKEN_EXPIRED" && autoRefresh) {
        addLog("info", "Access token expired - refreshing and retrying");
        const refreshed = await refreshAccessToken(session);
        if (refreshed) {
          result = await call(refreshed.accessToken);
          setLastResponse(result);
        }
      }

      if (result.ok && result.body?.success) {
        addLog(
          "ok",
          `/auth/me - steamID ${result.body.user.steamID}, profileID ${result.body.user.profileID}, session ${result.body.sessionID}`,
          result.body,
        );
      } else {
        addLog(
          "error",
          `/auth/me failed (${result.status}) - ${result.body?.code || "UNKNOWN"}: ${
            result.body?.message || result.body?.error
          }`,
          result.body,
        );
      }
    } catch (error) {
      addLog(
        "error",
        `/auth/me request threw: ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      setPendingAction(null);
    }
  };

  /** Sanity check that the endpoint really is protected. */
  const readMeWithBrokenToken = async () => {
    setPendingAction("me-broken");
    try {
      addLog("info", "GET /auth/me with a garbage token - expecting a 401");
      const result = await apiCall(`${apiBase}/auth/me`, {
        method: "GET",
        headers: { Authorization: "Bearer this-is-not-a-token" },
      });
      setLastResponse(result);
      addLog(
        result.status === 401 ? "ok" : "error",
        `/auth/me with a garbage token returned ${result.status} (${result.body?.code || "no code"})`,
        result.body,
      );
    } catch (error) {
      addLog("error", `Request threw: ${error instanceof Error ? error.message : error}`);
    } finally {
      setPendingAction(null);
    }
  };

  const handleLogout = async () => {
    if (!session) return;
    setPendingAction("logout");
    const loggedOut = session;

    try {
      addLog("info", "POST /auth/logout - deleting the session on the BE");
      const result = await apiCall(`${apiBase}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: loggedOut.refreshToken }),
      });

      setLastResponse(result);

      if (result.ok && result.body?.success) {
        addLog("ok", "Logged out - the refresh token is dead, clearing localStorage");
      } else {
        addLog(
          "error",
          `Logout failed (${result.status}) - ${result.body?.error || "unknown error"}`,
          result.body,
        );
      }

      persistSession(null);
      setSteamResponse(null);

      // Prove the session is really gone - the same refresh token must not work anymore.
      addLog("info", "Verifying the refresh token no longer works");
      const afterLogout = await apiCall(`${apiBase}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: loggedOut.refreshToken }),
      });
      addLog(
        afterLogout.status === 401 ? "ok" : "error",
        `Refresh after logout returned ${afterLogout.status} (${
          afterLogout.body?.code || "no code"
        }) - 401 SESSION_NOT_FOUND is what we want`,
        afterLogout.body,
      );
    } catch (error) {
      addLog("error", `Logout request threw: ${error instanceof Error ? error.message : error}`);
    } finally {
      setPendingAction(null);
    }
  };

  const clearLocalSession = () => {
    persistSession(null);
    setSteamResponse(null);
    setLastResponse(null);
    addLog("info", "Cleared the local session without telling the BE (session stays alive)");
  };

  const accessTokenExpired = session ? session.accessTokenExpiresAt <= Date.now() : false;

  return (
    <>
      <Head>
        <title>Steam login test - COH3 Stats</title>
        <meta name="description" content="Test page for the Steam OpenID login" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Container size="md" py="xl">
        <Stack gap="lg">
          <div>
            <Title order={1}>Steam login test</Title>
            <Text c="dimmed" mt={4}>
              Login, read the data, refresh and logout against the BE auth API. Everything is
              contained in <Code>pages/tests/login.tsx</Code>.
            </Text>
          </div>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between" wrap="wrap">
                <Title order={3}>API</Title>
                <SegmentedControl
                  value={apiTarget}
                  onChange={(value) => setApiTarget(value as ApiTarget)}
                  data={[
                    { label: "Cache proxy (prod)", value: "proxy" },
                    { label: "Local emulator", value: "emulator" },
                  ]}
                />
              </Group>
              <Text size="sm">
                <Code>{apiBase}/auth</Code>
              </Text>

              {mounted && !session && (
                <Button
                  leftSection={<IconBrandSteam size={20} />}
                  onClick={handleSteamLogin}
                  loading={pendingAction === "login"}
                  size="lg"
                >
                  Login with Steam
                </Button>
              )}

              {mounted && session && (
                <Group>
                  <Button
                    onClick={() => readMe(false)}
                    loading={pendingAction === "me"}
                    leftSection={<IconCheck size={16} />}
                  >
                    Read data (/auth/me)
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => readMe(true)}
                    loading={pendingAction === "me-auto"}
                  >
                    Read data with auto refresh
                  </Button>
                  <Button
                    variant="light"
                    onClick={handleRefresh}
                    loading={pendingAction === "refresh"}
                    leftSection={<IconRefresh size={16} />}
                  >
                    Refresh token
                  </Button>
                  <Button
                    color="red"
                    onClick={handleLogout}
                    loading={pendingAction === "logout"}
                    leftSection={<IconLogout size={16} />}
                  >
                    Logout
                  </Button>
                </Group>
              )}

              <Group>
                <Button
                  variant="default"
                  size="xs"
                  onClick={readMeWithBrokenToken}
                  loading={pendingAction === "me-broken"}
                >
                  Read data with a garbage token (expect 401)
                </Button>
                {mounted && session && (
                  <Button variant="default" size="xs" onClick={clearLocalSession}>
                    Clear local session only
                  </Button>
                )}
              </Group>
            </Stack>
          </Card>

          {mounted && session && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Title order={3}>Session</Title>
                  <Badge color={accessTokenExpired ? "red" : "green"} size="lg">
                    {accessTokenExpired ? "access token expired" : "logged in"}
                  </Badge>
                </Group>

                <Text size="sm">
                  <strong>steamID:</strong> <Code>{session.user.steamID}</Code>
                </Text>
                <Text size="sm">
                  <strong>profileID:</strong> <Code>{session.user.profileID}</Code>
                </Text>
                <Text size="sm">
                  <strong>createdAt:</strong>{" "}
                  <Code>{formatTimestamp(session.user.createdAt)}</Code>
                </Text>
                <Text size="sm">
                  <strong>lastLoginAt:</strong>{" "}
                  <Code>{formatTimestamp(session.user.lastLoginAt)}</Code>
                </Text>

                <Divider />

                <Text size="sm">
                  <strong>access token</strong> (expires in{" "}
                  {formatRemaining(session.accessTokenExpiresAt)}):{" "}
                  <Code>{shortToken(session.accessToken)}</Code>
                </Text>
                <Text size="sm">
                  <strong>refresh token</strong> (expires in{" "}
                  {formatRemaining(session.refreshTokenExpiresAt)}):{" "}
                  <Code>{shortToken(session.refreshToken)}</Code>
                </Text>
              </Stack>
            </Card>
          )}

          {steamResponse && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="xs">
                <Title order={3}>Steam OpenID response</Title>
                <Text size="sm" c="dimmed">
                  Exactly what we POST to <Code>/auth/login</Code>.
                </Text>
                <ScrollArea.Autosize mah={260}>
                  <Code block>{JSON.stringify(steamResponse, null, 2)}</Code>
                </ScrollArea.Autosize>
              </Stack>
            </Card>
          )}

          {lastResponse && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Title order={3}>Last API response</Title>
                  <Badge color={lastResponse.ok ? "green" : "red"}>
                    HTTP {lastResponse.status}
                  </Badge>
                </Group>
                <ScrollArea.Autosize mah={300}>
                  <Code block>{JSON.stringify(lastResponse.body, null, 2)}</Code>
                </ScrollArea.Autosize>
              </Stack>
            </Card>
          )}

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Title order={3}>Log</Title>
              {log.length === 0 ? (
                <Text size="sm" c="dimmed">
                  Nothing yet.
                </Text>
              ) : (
                <ScrollArea.Autosize mah={420}>
                  <Stack gap={6}>
                    {log.map((entry) => (
                      <Group key={entry.id} gap="xs" wrap="nowrap" align="flex-start">
                        {entry.level === "error" ? (
                          <IconX size={16} color="var(--mantine-color-red-6)" />
                        ) : entry.level === "ok" ? (
                          <IconCheck size={16} color="var(--mantine-color-green-6)" />
                        ) : (
                          <Text size="xs" c="dimmed" w={16} ta="center">
                            &middot;
                          </Text>
                        )}
                        <Text size="xs" c="dimmed" ff="monospace">
                          {entry.time}
                        </Text>
                        <Text size="sm" c={LOG_COLORS[entry.level]} style={{ flex: 1 }}>
                          {entry.message}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              )}
            </Stack>
          </Card>

          <Alert color="blue" title="Notes">
            <Stack gap={4}>
              <Text size="sm">
                Tokens are kept in <Code>localStorage</Code> under <Code>{STORAGE_KEY}</Code> -
                fine for a test page, we still need to decide on the real storage (memory +
                httpOnly cookie for the refresh token would be safer).
              </Text>
              <Text size="sm">
                The access token lives 1 hour, the refresh token 90 days. Logout deletes the
                session so the refresh token dies immediately, but the access token stays valid
                until it expires - the BE does not read the DB when verifying it.
              </Text>
              <Text size="sm">
                Login only works for Steam accounts that have a COH3 profile - anything else comes
                back as 403 <Code>PROFILE_NOT_FOUND</Code>.
              </Text>
              <Text size="sm">
                Full payloads of every step are logged into the browser console under{" "}
                <Code>[login-test]</Code>.
              </Text>
            </Stack>
          </Alert>
        </Stack>
      </Container>
    </>
  );
};

// Only so the header / footer around the test page are not full of raw translation keys.
export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default LoginTestPage;
