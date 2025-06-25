import { ColorSchemeScript } from "@mantine/core";
import Document, { Head, Html, Main, NextScript } from "next/document";

// This is supposed to mimic mantineHtmlProps from @mantine/core
const htmlProps = {
  "data-mantine-color-scheme": "dark",
  suppressHydrationWarning: true,
};

export default class _Document extends Document {
  render() {
    return (
      <Html {...htmlProps}>
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
