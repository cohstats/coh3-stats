import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider, ColorScheme, ColorSchemeProvider, Loader } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { useDebouncedState, useDidUpdate, useLocalStorage } from "@mantine/hooks";
import Script from "next/script";
import config from "../config";
import webFirebase from "../src/firebase/web-firebase";
import {
  registerSpotlightActions,
  removeSpotlightActions,
  SpotlightAction,
  SpotlightProvider,
} from "@mantine/spotlight";
import { IconFileText, IconSearch } from "@tabler/icons";
import { useRef } from "react";
import { SearchPlayerEntry } from "../components/SearchPlayerEntry";
import { BetaVersion } from "../components/beta-version";
webFirebase.init();

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps, router } = props;

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  let layoutContent = true;
  if ([`/landing`].includes(router.pathname)) {
    layoutContent = false;
  }

  const contentWithLayout = (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );

  const contentWithoutLayout = <Component {...pageProps} />;
  /* Spotlight Search Related */
  const fetchingRef = useRef(false);
  // debounce query (wait till user stopped actively entering stuff in the search field)
  const [debouncedQuery, setDebouncedQuery] = useDebouncedState("", 200);
  /**
   * Request additional results for the spotlight search based on the user input and add to spotlight entries
   * @param query Search input
   */
  const fetchResults = async (query: string) => {
    console.log("SEARCH", query);

    let data = null;
    let error = null;

    try {
      const res = await fetch(
        `${config.BASE_CLOUD_FUNCTIONS_URL}/searchPlayersHttp?alias=${query}`,
      );

      // Also check status code if not 200
      data = await res.json();
      const newEntries: SpotlightAction[] = [];
      for (const playerKey in data) {
        const playerData = data[playerKey];
        newEntries.push({
          id: playerData.relicProfile.id,
          image: playerData.steamProfile.avatarmedium,
          xp: playerData.relicProfile.members[0].xp,
          level: playerData.relicProfile.members[0].level,
          country: playerData.relicProfile.members[0].country,
          playerID: playerData.relicProfile.members[0].profile_id,
          title: playerData.relicProfile.members[0].alias,
          onTrigger: () =>
            router.replace("/players/" + playerData.relicProfile.members[0].profile_id),
          icon: <IconFileText size={18} />,
        });
      }
      removeSpotlightActions(newEntries.map((entry) => entry.id!));
      registerSpotlightActions(newEntries);
      fetchingRef.current = false;

      console.log(data);
    } catch (e: any) {
      console.error(`Failed getting data for player id ${query}`);
      console.error(e);
      error = e.message;
    }
  };
  // when debounced query entry changes fetch player results
  useDidUpdate(() => {
    if (debouncedQuery.length > 1) {
      fetchingRef.current = true;
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <>
      <Head>
        <title>COH3 Stats</title>
        <meta
          name="description"
          content="Company of Heroes 3 Stats. Leaderboards, Player Card, Past Matches, Unit stats and much more"
        />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/logo/favicon.ico" />
      </Head>
      <Script
        id="rum-lib"
        src="https://rum.layer0.co/latest.js"
        onLoad={() => {
          // @ts-ignore
          new Layer0.Metrics({
            token: "43cf5623-832d-4e95-aae9-8c2a9368680c",
          }).collect();
        }}
      />

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
          <NotificationsProvider>
            <SpotlightProvider
              onSpotlightClose={() => setDebouncedQuery("")}
              actions={[]}
              searchIcon={<IconSearch size={18} />}
              searchPlaceholder="Search..."
              actionComponent={SearchPlayerEntry}
              shortcut="mod + K"
              nothingFoundMessage={fetchingRef.current ? <Loader /> : "Nothing found..."}
              onChange={async (event) => {
                setDebouncedQuery((event.target as any).value);
              }}
            >
              <BetaVersion />
              {layoutContent && contentWithLayout}
              {!layoutContent && contentWithoutLayout}
            </SpotlightProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
