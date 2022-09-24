import type { NextPage } from "next";
import Head from "next/head";
import Link from 'next/link';
import { Button } from '@mantine/core';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>COH3 Stats</title>
        <meta name="description" content="Company of heroes 3" />
        <link rel="icon" href="/logo/favicon.ico" />
      </Head>

      <main >
          <Link href="/hello" passHref>
              <Button component="a">Next link button</Button>
          </Link>
      </main>

      <footer >
        Eat my shorts
      </footer>
    </div>
  );
};

export default Home;
