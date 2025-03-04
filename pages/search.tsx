import { NextPage } from "next";
import Head from "next/head";
import { generateKeywordsString } from "../src/head-utils";
import { SearchScreen } from "../screens/search";

/**
 *
 * Example URL http://localhost:3000/search?q=Thomas
 *
 *
 * @constructor
 */

const Search: NextPage = () => {
  const description = "Search for any players in Company of Heroes 3.";
  const metaKeywords = generateKeywordsString([`search players`, `search data`, `coh3 search`]);

  return (
    <>
      <Head>
        <title>{"COH3 Stats - Search"}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={metaKeywords} />
        <meta name="robots" content="nofollow" />
      </Head>
      <SearchScreen />
    </>
  );
};

export default Search;
