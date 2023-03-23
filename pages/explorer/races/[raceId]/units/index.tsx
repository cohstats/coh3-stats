import { Stack, Title } from "@mantine/core";
import { NextPage } from "next";
import Head from "next/head";
import ContentContainer from "../../../../../components/Content-container";

const ExplorerUnits: NextPage = () => {
  return (
    <>
      <Head>
        <title>Units - COH3 Explorer</title>
        <meta name="description" content={`Units - COH3 Explorer`} />
      </Head>
      <ContentContainer>
        <Stack mb={24}>
          <Title order={2}>Company of Heroes 3 - Units</Title>
        </Stack>
      </ContentContainer>
    </>
  );
};

export default ExplorerUnits;
