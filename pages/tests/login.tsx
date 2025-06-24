import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Stack,
  Alert,
  Code,
  Divider,
  Group,
  Badge,
} from "@mantine/core";
import { IconBrandSteam, IconCheck, IconX } from "@tabler/icons-react";
import config from "../../config";
import { getSteamLoginRoute } from "../../src/routes";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import {
  authenticateSteamUser,
  SteamOpenIDResponse,
  SteamAuthResponse,
} from "../../src/apis/coh3stats-api";

// Using SteamOpenIDResponse from coh3stats-api instead of local interface

const TestsPage: NextPage = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [steamResponse, setSteamResponse] = useState<SteamOpenIDResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<SteamAuthResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Get the current site URL based on environment
  const getSiteUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.host}`;
    }
    // For development, use localhost, for production use the configured site URL
    if (config.isDevEnv()) {
      return "http://localhost:3000";
    }
    return config.SITE_URL;
  };

  const siteUrl = getSiteUrl();
  const returnUrl = `${siteUrl}/tests`;
  const realm = siteUrl;

  useEffect(() => {
    // Check if we have Steam OpenID response parameters
    const query = router.query;

    // Only process when router is ready and we have query parameters
    if (router.isReady && query["openid.mode"] === "id_res") {
      const response: SteamOpenIDResponse = {} as SteamOpenIDResponse;
      Object.keys(query).forEach((key) => {
        if (key.startsWith("openid.")) {
          response[key as keyof SteamOpenIDResponse] = query[key] as string;
        }
      });
      setSteamResponse(response);
    }
  }, [router.query, router.isReady]);

  const handleSteamLogin = () => {
    const steamLoginUrl = getSteamLoginRoute(returnUrl, realm);
    window.location.href = steamLoginUrl;
  };

  const authenticateWithSteam = async () => {
    if (!steamResponse) return;

    setIsLoading(true);
    setAuthResult(null);
    setAuthError(null);

    try {
      const result = await authenticateSteamUser(steamResponse);
      setAuthResult(result);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const extractSteamId = (claimedId?: string) => {
    if (!claimedId) return null;
    const match = claimedId.match(/\/id\/(\d+)$/);
    return match ? match[1] : null;
  };

  const clearResponse = () => {
    setSteamResponse(null);
    setAuthResult(null);
    setAuthError(null);
    router.replace("/tests", undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>
          {t("Steam Login Test - COH3 Stats", { defaultValue: "Steam Login Test - COH3 Stats" })}
        </title>
        <meta
          name="description"
          content={t("Steam OpenID login testing page", {
            defaultValue: "Steam OpenID login testing page",
          })}
        />
      </Head>

      <Container size="md" py="xl">
        <Stack gap="lg">
          <div>
            <Title order={1}>{t("Steam Login Test", { defaultValue: "Steam Login Test" })}</Title>
            <Text size="lg" c="dimmed" mt="sm">
              {t("Test Steam OpenID authentication integration", {
                defaultValue: "Test Steam OpenID authentication integration",
              })}
            </Text>
          </div>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>{t("Configuration", { defaultValue: "Configuration" })}</Title>
                <Badge color="blue" variant="light">
                  {config.isDevEnv()
                    ? t("Development", { defaultValue: "Development" })
                    : t("Production", { defaultValue: "Production" })}
                </Badge>
              </Group>

              <Stack gap="xs">
                <Text size="sm">
                  <strong>{t("Return URL:", { defaultValue: "Return URL:" })}</strong>{" "}
                  <Code>{returnUrl}</Code>
                </Text>
                <Text size="sm">
                  <strong>{t("Realm:", { defaultValue: "Realm:" })}</strong> <Code>{realm}</Code>
                </Text>
              </Stack>

              {!steamResponse ? (
                <Button
                  leftSection={<IconBrandSteam size={20} />}
                  onClick={handleSteamLogin}
                  size="lg"
                  color="blue"
                >
                  {t("Login with Steam", { defaultValue: "Login with Steam" })}
                </Button>
              ) : (
                <Button variant="outline" onClick={clearResponse} size="sm">
                  {t("Clear Response & Try Again", {
                    defaultValue: "Clear Response & Try Again",
                  })}
                </Button>
              )}
            </Stack>
          </Card>

          {steamResponse && (
            <>
              <Alert
                icon={<IconCheck size={16} />}
                title={t("Steam Login Response Received", {
                  defaultValue: "Steam Login Response Received",
                })}
                color="green"
              >
                {t(
                  "Steam has redirected back with authentication data. Review the response below.",
                  {
                    defaultValue:
                      "Steam has redirected back with authentication data. Review the response below.",
                  },
                )}
              </Alert>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={3}>
                      {t("Response Data", { defaultValue: "Response Data" })}
                    </Title>
                    {extractSteamId(steamResponse["openid.claimed_id"]) && (
                      <Badge color="green" size="lg">
                        {t("Steam ID:", { defaultValue: "Steam ID:" })}{" "}
                        {extractSteamId(steamResponse["openid.claimed_id"])}
                      </Badge>
                    )}
                  </Group>

                  <Stack gap="xs">
                    {Object.entries(steamResponse).map(([key, value]) => (
                      <div key={key}>
                        <Text size="sm" fw={500}>
                          {key}:
                        </Text>
                        <Code block>{value}</Code>
                      </div>
                    ))}
                  </Stack>

                  <Divider />

                  <Button
                    onClick={authenticateWithSteam}
                    loading={isLoading}
                    leftSection={<IconCheck size={16} />}
                    color="green"
                  >
                    {t("Authenticate with Steam", { defaultValue: "Authenticate with Steam" })}
                  </Button>

                  {authResult && (
                    <Alert
                      icon={<IconCheck size={16} />}
                      title={t("Authentication Successful", {
                        defaultValue: "Authentication Successful",
                      })}
                      color="green"
                    >
                      <Stack gap="xs">
                        <Text size="sm">
                          <strong>{t("Steam ID:", { defaultValue: "Steam ID:" })}</strong>{" "}
                          <Code>{authResult.steamId}</Code>
                        </Text>
                        {authResult.message && (
                          <Text size="sm">
                            <strong>{t("Message:", { defaultValue: "Message:" })}</strong>{" "}
                            {authResult.message}
                          </Text>
                        )}
                      </Stack>
                    </Alert>
                  )}

                  {authError && (
                    <Alert
                      icon={<IconX size={16} />}
                      title={t("Authentication Failed", {
                        defaultValue: "Authentication Failed",
                      })}
                      color="red"
                    >
                      <Text size="sm">{authError}</Text>
                    </Alert>
                  )}
                </Stack>
              </Card>
            </>
          )}

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>{t("How it works", { defaultValue: "How it works" })}</Title>
              <Stack gap="xs">
                <Text size="sm">
                  {t('1. Click "Login with Steam" to redirect to Steam\'s OpenID login', {
                    defaultValue:
                      '1. Click "Login with Steam" to redirect to Steam\'s OpenID login',
                  })}
                </Text>
                <Text size="sm">
                  {t(
                    "2. Steam will authenticate the user and redirect back with query parameters",
                    {
                      defaultValue:
                        "2. Steam will authenticate the user and redirect back with query parameters",
                    },
                  )}
                </Text>
                <Text size="sm">
                  {t(
                    '3. Click "Authenticate with Steam" to verify the response with your backend',
                    {
                      defaultValue:
                        '3. Click "Authenticate with Steam" to verify the response with your backend',
                    },
                  )}
                </Text>
                <Text size="sm">
                  {t(
                    "4. The backend will verify with Steam and return the user's Steam ID if successful",
                    {
                      defaultValue:
                        "4. The backend will verify with Steam and return the user's Steam ID if successful",
                    },
                  )}
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default TestsPage;
