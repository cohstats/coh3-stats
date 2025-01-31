import { Anchor, Space, Text, Title } from "@mantine/core";
import { getOpenDataRoute } from "../../src/routes";

const DataSection = () => {
  return (
    <>
      <Title order={5}>Leaderboards</Title>
      Live data from Relic servers.
      <Space h={"xs"} />
      <Title order={5}>Player Cards</Title>
      Live data from Relic servers mixed with data from our database.
      <Space h={"xs"} />
      <Title order={5}>Stats Data</Title>
      Data from our database. Updated daily ~6 AM UTC unless specified otherwise.
      <div style={{ paddingLeft: 25 }}>
        <Title order={5}>Data Scraping</Title>
        COH3 Stats monitors live games every 5 minutes. Ever game which we observe is downloaded
        into our database.
        <br />
        This should include all automatch games, all AI games and some custom games.
        <br />
        Unfortunately custom games are not "observable" by default.
        <br />
        <br />
        You can download the data we are scraping. More info on{" "}
        <Anchor href={getOpenDataRoute()}> Open Data</Anchor> page.
      </div>
      <Space h={"xs"} />
      <Title order={5}>Explorer</Title>
      All the data for units, DPS calculators, faction overviews are generated directly from the
      game files. There are often a bugs in the COH source files, please report any problems you
      find to us. Thank you
      <Title order={1} size="h4" pt="md">
        API Usage / Collaboration
      </Title>
      We are open for collaboration / sharing the data. Check out our{" "}
      <Anchor href={getOpenDataRoute()}> Open Data</Anchor> page. Or reach out to us on Discord.
      <br />
      <Text fw={500}>
        Its forbidden to use our API or scrape the site without previous consulting!
      </Text>
    </>
  );
};

export default DataSection;
