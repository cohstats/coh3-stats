import { AppProps } from "next/app";
import Router from "next/router";
import Head from "next/head";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import Script from "next/script";
import webFirebase from "../src/firebase/web-firebase";
import { BetaVersion } from "../components/other/beta-version";
import CustomSpotlightProvider from "../components/customSpotlightProvider";
import { useEffect, useRef } from "react";
import NProgress from "nprogress";
import "../components/other/nprogress.css";

webFirebase.init();

NProgress.configure({ showSpinner: false });

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps, router } = props;

  // get system colorscheme
  const systemColorScheme = useColorScheme("dark");
  const prevSystemColorSchemeRef = useRef(systemColorScheme);

  // create a cookie on browser to store if the user is visiting the site for the first time
  const [firstVisit, setFirstVisit] = useLocalStorage<boolean>({
    key: "first-visit",
    defaultValue: true,
    getInitialValueInEffect: true,
  });

  // create a cookie on browser to store colorscheme starting out with system colorscheme as default
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: systemColorScheme,
    getInitialValueInEffect: true,
  });

  // useColorScheme returns an incorrect initial value due to serverside rendering
  // when on the client for the first time set the colorscheme to system preferences
  useEffect(() => {
    if (typeof document !== "undefined") {
      // only run on client side
      if (prevSystemColorSchemeRef.current !== systemColorScheme) {
        if (firstVisit) {
          setColorScheme(systemColorScheme);
          setFirstVisit(false);
        }
      }
      prevSystemColorSchemeRef.current = systemColorScheme;
    }
  }, [systemColorScheme]);

  // switch colorscheme
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useEffect(() => {
    Router.events.on("routeChangeStart", () => {
      NProgress.start();
    });

    Router.events.on("routeChangeComplete", () => {
      NProgress.done(false);
    });

    Router.events.on("routeChangeError", () => {
      NProgress.done(false);
    });
  }, []);

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
            <CustomSpotlightProvider>
              <BetaVersion />
              {layoutContent && contentWithLayout}
              {!layoutContent && contentWithoutLayout}
            </CustomSpotlightProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
