import { ColorSchemeScript } from '@mantine/core';
import Document, { Head, Html, Main, NextScript } from "next/document";


export default class _Document extends Document {

  render() {
    return (
      <Html>
        <Head>
          <ColorSchemeScript defaultColorScheme="dark"/>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
