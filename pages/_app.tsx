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
import { IconDashboard, IconFileText, IconHome, IconSearch } from "@tabler/icons";
import { useRef, useState } from "react";
import { SearchPlayerEntry } from "../components/SearchPlayerEntry";
import { useRouter } from "next/router";
webFirebase.init();

const demoItems: SpotlightAction[] = [
  {
    title: "Home",
    description: "Get to home page",
    onTrigger: () => console.log("Home"),
    icon: <IconHome size={18} />,
  },
  {
    title: "Dashboard",
    description: "Get full information about current system status",
    onTrigger: () => console.log("Dashboard"),
    icon: <IconDashboard size={18} />,
  },
  {
    title: "Documentation",
    description: "Visit documentation to lean more about all features",
    onTrigger: () => console.log("Documentation"),
    icon: <IconFileText size={18} />,
  },
];

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps, router } = props;
  // const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

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
  const fetchingRef = useRef(false);
  const [debouncedQuery, setDebouncedQuery] = useDebouncedState("", 200);
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
      for (let playerKey in data) {
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
  useDidUpdate(() => {
    console.log("value changed", debouncedQuery);
    if (debouncedQuery.length > 1) {
      fetchingRef.current = true;
      fetchResults(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <>
      <Head>
        <title>COH3 Stats</title>
        <meta name="description" content="Company of heroes 3" />
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
              {layoutContent && contentWithLayout}
              {!layoutContent && contentWithoutLayout}
            </SpotlightProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
