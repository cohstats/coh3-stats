import config from "../config";

/**
 *
 * Example URL http://localhost:3000/search?q=Thomas
 *
 *
 * @param searchQuery
 * @param data
 * @param error
 * @constructor
 */

// @ts-ignore
function Search({ searchQuery, data, error }) {
  // Render data...

  return (
    <>
      <div>Search query {searchQuery}</div>
      <div>Data {JSON.stringify(data)}</div>
      <div>error {JSON.stringify(error)}</div>
    </>
  );
}

// @ts-ignore
export async function getServerSideProps({ query }) {
  const { q } = query;

  console.log("SEARCH", q);

  let data = null;
  let error = null;

  try {
    const res = await fetch(`${config.BASE_CLOUD_FUNCTIONS_URL}/searchPlayersHttp?alias=${q}`);

    console.log("fetching");
    // Also check status code if not 200

    data = await res.json();
  } catch (e: any) {
    console.error(`Failed getting data for player id ${q}`);
    console.error(e);
    error = e.message;
  }

  return {
    props: { searchQuery: q, data, error }, // will be passed to the page component as props
  };
}

export default Search;
