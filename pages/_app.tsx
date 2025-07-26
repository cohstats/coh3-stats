import "@mantine/core/styles.layer.css";
import "@mantine/dates/styles.css";
import "@mantine/carousel/styles.css";
import "mantine-datatable/styles.layer.css";

import { AppProps } from "next/app";
import Router from "next/router";
import Head from "next/head";
import { localStorageColorSchemeManager, MantineProvider } from "@mantine/core";
// import { Notifications } from "@mantine/notifications";
import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
// import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import webFirebase from "../src/firebase/web-firebase";
import { useEffect } from "react";
import NProgress from "nprogress";
import "../components/other/nprogress.css";
import ContentContainer from "../components/Content-container";
import config from "../config";
import DevSiteNotification from "../components/dev-site-notification";
// import { useServiceWorker } from "@edgio/react";
import { appWithTranslation } from "next-i18next";
import { UserConfig } from "next-i18next";
import nextI18NextConfig from "../next-i18next.config";
import { useRouter } from "next/router";
import { getCookie } from "../src/utils";
import { DefaultSeo } from "next-seo";
import defaultSEO from "../next-seo.config";

const emptyInitialI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
  defaultNS: "common",
  localePath: nextI18NextConfig.localePath,
};

import "./layout.css";

webFirebase.init();

NProgress.configure({ showSpinner: false });

function App(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  const colorSchemeManager = localStorageColorSchemeManager({
    key: "mantine-color-scheme",
  });

  // useServiceWorker({});

  // get system colorscheme
  // const systemColorScheme = useColorScheme("dark");
  // const prevSystemColorSchemeRef = useRef(systemColorScheme);
  //
  // // create a cookie on browser to store if the user is visiting the site for the first time
  // const [firstVisit, setFirstVisit] = useLocalStorage<boolean>({
  //   key: "first-visit",
  //   defaultValue: true,
  //   getInitialValueInEffect: true,
  // });

  // create a cookie on browser to store colorscheme starting out with system colorscheme as default
  // const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
  //   key: "mantine-color-scheme",
  //   defaultValue: systemColorScheme,
  //   getInitialValueInEffect: true,
  // });

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
  // const toggleColorScheme = (value?: ColorScheme) =>
  //   setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useEffect(() => {
    // Cookie language change - detect NEXT_LOCALE cookie and redirect if needed
    const cookieLocale = getCookie("NEXT_LOCALE");
    const currentLocale = router.locale;
    const supportedLocales = nextI18NextConfig.i18n.locales;

    if (
      cookieLocale &&
      currentLocale &&
      cookieLocale !== currentLocale &&
      supportedLocales.includes(cookieLocale)
    ) {
      // Redirect to the locale specified in the cookie
      const { pathname, asPath, query } = router;
      router.push({ pathname, query }, asPath, { locale: cookieLocale });
      return; // Exit early to avoid setting up other event listeners during redirect
    }

    // Show progress bar on route change
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
  }, [router]);

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
      <DefaultSeo {...defaultSEO} />
      <Head>
        {/* Keep only the opensearch link as it's not covered by next-seo */}
        <link
          type="application/opensearchdescription+xml"
          rel="search"
          title={"Search COH3 players"}
          href={`${config.SITE_URL}/opensearch.xml`}
        />
      </Head>

      <MantineProvider defaultColorScheme="dark" colorSchemeManager={colorSchemeManager}>
        {/*<Notifications />*/}
        {layoutContent && contentWithLayout}
        {!layoutContent && contentWithoutLayout}
      </MantineProvider>

      {/*<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>*/}
      {/*  <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>*/}
      {/*   */}
      {/*  </MantineProvider>*/}
      {/*</ColorSchemeProvider>*/}
    </>
  );
}

export default appWithTranslation(App, emptyInitialI18NextConfig);
