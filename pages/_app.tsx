import { AppProps } from "next/app";
import Head from "next/head";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import Script from "next/script";
import webFirebase from "../src/firebase/web-firebase";
import { BetaVersion } from "../components/beta-version";
import CustomSpotlightProvider from "../components/customSpotlightProvider";

webFirebase.init();

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps, router } = props;

  // get system colorscheme
  const systemColorScheme = useColorScheme();

  // create a cookie on browser to store colorscheme starting out with system colorscheme as default
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: systemColorScheme,
    getInitialValueInEffect: true,
  });

  // switch colorscheme
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
