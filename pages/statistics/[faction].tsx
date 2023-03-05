import { Container, Flex, Table, Title, TextInput } from "@mantine/core";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { localizedNames } from "../../src/coh3/coh3-data";
import { normalizeWeapons, NullableNormalizedWeapon } from "../../tools/weapon-normalizer";
import FactionIcon from "../../components/faction-icon";
import { useState } from "react";
import { IconSearch } from "@tabler/icons";
import { keys } from "lodash";
import { raceType } from "../../src/coh3/coh3-types";

function filterData(data: NullableNormalizedWeapon[], search: string) {
  const query = search.toLowerCase().trim();

  return data.filter((item) =>
    keys(data[0]).some((key) => {
      const value = item[key as keyof NullableNormalizedWeapon];
      return value && typeof value === "string" && value.toLowerCase().includes(query);
    }),
  );
}

export interface FactionsProps {
  faction?: keyof typeof localizedNames;
  weapons?: NullableNormalizedWeapon[];
}

const Faction = ({ faction, weapons }: FactionsProps) => {
  console.log(faction);
  const [search, setSearch] = useState("");
  const wehrmachtWeapons = weapons?.filter((weapon) =>
    // compensating for a little mismatch between our raceType and the game's name for DAK
    faction === "dak" ? weapon.owner === "afrika_korps" : weapon.owner === faction,
  );

  const [sortedData, setSortedData] = useState(wehrmachtWeapons);

  if (!weapons || !faction) return null;

  const name = (w: NullableNormalizedWeapon) =>
    w.displayName ? `${w.displayName} -  ${w.referenceName}` : w.referenceName;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (wehrmachtWeapons === undefined) return;

    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(filterData(wehrmachtWeapons, value));
  };

  const ths = (
    <tr>
      <th>Name</th>
      <th>Category</th>
      <th>Type</th>
      <th>Subtype</th>
      <th>Accuracy Far</th>
      <th>Accuracy Mid</th>
      <th>Accuracy Near</th>
    </tr>
  );

  const rows = sortedData?.map((element) => (
    <tr key={name(element)}>
      <td>{name(element)}</td>
      <td>{element.category}</td>
      <td>{element.type}</td>
      <td>{element.subtype}</td>
      <td>{element.accuracy?.far}</td>
      <td>{element.accuracy?.mid}</td>
      <td>{element.accuracy?.near}</td>
    </tr>
  ));

  return (
    <div>
      <Head>
        <title>Explorer</title>
        <meta name="description" content="COH3 Stats - learn more about our page." />
      </Head>
      <>
        <Container size={"xl"}>
          <Flex align="center" mb={50}>
            <FactionIcon name={faction} width={40} />
            <Title order={1} size="h4" pt="md" ml={10}>
              {faction && localizedNames[faction]} Weapons
            </Title>
          </Flex>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            icon={<IconSearch size="0.9rem" stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
          />
          <Table
            captionSide="bottom"
            striped
            withBorder
            highlightOnHover
            horizontalSpacing="lg"
            miw={900}
          >
            <caption>{localizedNames[faction]} Weapons</caption>
            <thead>{ths}</thead>
            <tbody>{rows}</tbody>
          </Table>
        </Container>
      </>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<{ faction: raceType }> = async () => {
  return {
    paths: [
      {
        params: { faction: "american" },
      },
      {
        params: { faction: "german" },
      },
      {
        params: { faction: "british" },
      },
      {
        params: { faction: "dak" },
      },
    ],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<FactionsProps> = async ({ params }) => {
  const faction = params?.faction as keyof typeof localizedNames | undefined;

  const weaponsReq = await fetch(
    "https://github.com/cohstats/coh3-data/raw/xml-data/scripts/xml-to-json/exported/weapon.json",
  );

  const locstringReq = await fetch(
    "https://github.com/cohstats/coh3-data/raw/xml-data/scripts/xml-to-json/exported/locstring.json",
  );

  const weaponData = await weaponsReq.json();
  const locstringData = await locstringReq.json();

  const flattenedWeapons = normalizeWeapons(weaponData, locstringData);

  return {
    props: {
      weapons: flattenedWeapons,
      faction,
      key: faction,
    },
  };
};

export default Faction;
