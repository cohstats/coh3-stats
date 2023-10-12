import { AppProps } from "next/app";
import Router from "next/router";
import Head from "next/head";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import webFirebase from "../src/firebase/web-firebase";
import { BetaVersion } from "../components/other/beta-version";
import { useEffect } from "react";
import NProgress from "nprogress";
import "../components/other/nprogress.css";
import ContentContainer from "../components/Content-container";
import config from "../config";
import DevSiteNotification from "../components/dev-site-notification";
import { useServiceWorker, useDevtools } from "@edgio/react";
import { Metrics } from "@edgio/rum";

webFirebase.init();

NProgress.configure({ showSpinner: false });

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;

  useDevtools();

  new Metrics({
    token: "63a45f52-3972-4ed0-8867-4e762860a563", // Get your token from the Edgio Console
  })
    .collect()
    .then();

  useServiceWorker({});

  // get system colorscheme
  const systemColorScheme = useColorScheme("dark");
  // const prevSystemColorSchemeRef = useRef(systemColorScheme);
  //
  // // create a cookie on browser to store if the user is visiting the site for the first time
  // const [firstVisit, setFirstVisit] = useLocalStorage<boolean>({
  //   key: "first-visit",
  //   defaultValue: true,
  //   getInitialValueInEffect: true,
  // });

  // create a cookie on browser to store colorscheme starting out with system colorscheme as default
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: systemColorScheme,
    getInitialValueInEffect: true,
  });

  // // useColorScheme returns an incorrect initial value due to serverside rendering
  // // when on the client for the first time set the colorscheme to system preferences
  // useEffect(() => {
  //   if (typeof document !== "undefined") {
  //     // only run on client side
  //     if (prevSystemColorSchemeRef.current !== systemColorScheme) {
  //       if (firstVisit) {
  //         setColorScheme(systemColorScheme);
  //         setFirstVisit(false);
  //       }
  //     }
  //     prevSystemColorSchemeRef.current = systemColorScheme;
  //   }
  // }, [systemColorScheme]);

  // switch colorscheme
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useEffect(() => {
    Router.events.on("routeChangeStart", (url, { shallow }) => {
      // If it's a shallow change, don't show the progress bar
      if (shallow) return;
      NProgress.start();
    });

    Router.events.on("routeChangeComplete", () => {
      NProgress.done(false);
    });

    Router.events.on("routeChangeError", () => {
      NProgress.done(false);
    });
  }, []);

  const layoutContent = true;

  const contentWithLayout = (
    <>
      <Header />
      <ContentContainer>
        {" "}
        <Component {...pageProps} />
      </ContentContainer>
      {config.isDevEnv() && <DevSiteNotification />}
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
        <meta
          name="keywords"
          content="Company of Heroes 3, COH3, COH3 Stats, COH3 Leaderboards, COH3 Player Cards, COH3 Info"
        />
        <link rel="shortcut icon" href="/logo/favicon.ico" />
        <link
          type="application/opensearchdescription+xml"
          rel="search"
          title={"Search COH3 players"}
          href="/opensearch.xml"
        />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
          <Notifications />
          <BetaVersion />
          {layoutContent && contentWithLayout}
          {!layoutContent && contentWithoutLayout}
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
