import { getLeaderBoardData } from "../src/coh3/coh3-api";
import { findAndMergeStatGroups } from "../src/coh3/helpers";
import { Container, Group, Select, Space, Text, Title, Anchor } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import Link from "next/link";

import React from "react";
import { calculatePageNumber, calculatePositionNumber } from "../src/utils";
import ErrorCard from "../components/error-card";
import CountryFlag from "../components/country-flag";
import Head from "next/head";
import { localizedGameTypes, localizedNames } from "../src/coh3/coh3-data";
import { raceType, leaderBoardType } from "../src/coh3/coh3-types";
import FactionIcon from "../components/faction-icon";
import { GetServerSideProps } from "next";


const Leaderboards = ({
                        leaderBoardData,
                        error,
                        start,
                        totalRecords,
                        raceToFetch,
                        typeToFetch,
                      }: any) => {


  const localizedRace = localizedNames[raceToFetch as raceType];
  const localizedType = localizedGameTypes[typeToFetch as leaderBoardType];
  const pageTitle = `Leaderboards for ${localizedRace} ${localizedType}`;
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Ranked leaderboards for faction ${localizedRace} and game type ${localizedType}. Company of Heroes 3`}
        />
        <meta
          name="keywords"
          content={`coh3, coh3 leaderboards, coh3 ${raceToFetch} leaderboards, coh3 live leaderboards, coh3 stats`}
        />
        <meta property="og:image" content={`/icons/general/${raceToFetch}.webp`} />
      </Head>
      <Container fluid p={0}>

      </Container>
    </>
  );
};

const sortById = {
  wins: 0,
  elo: 1,
};

export const getServerSideProps: GetServerSideProps = async ({  }) => {

  try {
    const leaderBoardDataRaw = await getLeaderBoardData(
      raceToFetch,
      typeToFetch,
      sortByToFetch,
      200,
      startToFetch,
    );
    totalRecords = leaderBoardDataRaw.rankTotal;
    leaderBoardData = findAndMergeStatGroups(leaderBoardDataRaw, null);
  } catch (e: any) {
    console.error(`Error getting the leaderboards`);
    console.error(e);
    error = e.message;
  }


};

export default Leaderboards;
