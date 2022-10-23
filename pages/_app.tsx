import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider, ColorScheme, ColorSchemeProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { useLocalStorage } from "@mantine/hooks";
import Script from "next/script";

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
            {layoutContent && contentWithLayout}
            {!layoutContent && contentWithoutLayout}
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
