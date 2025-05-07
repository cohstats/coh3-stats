import { ColorSchemeScript } from "@mantine/core";
import Document, { Head, Html, Main, NextScript } from "next/document";

export default class _Document extends Document {
  render() {
    return (
      <Html data-mantine-color-scheme="dark">
        <Head>
          <ColorSchemeScript defaultColorScheme="dark" />
          {/* Add no-js fallback CSS with noscript tag */}
          <noscript>
            <link rel="stylesheet" href="/no-js-fallback.css" />
          </noscript>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
