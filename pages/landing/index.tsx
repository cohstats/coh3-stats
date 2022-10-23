import type { NextPage } from "next";
import { Title, Group, Stack, Space } from "@mantine/core";
import { Discord } from "../../components/Icons/Discord";
import { Github } from "../../components/Icons/Github";
import React from "react";

const Landing: NextPage = () => {
  return (
    <div
      style={{
        backgroundImage: " url('https://4kwallpapers.com/images/walls/thumbs_3t/5968.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundSize: "cover",
        height: "100%",
        width: "100%",
        left: "0",
        top: "0",
        overflow: "hidden",
        position: "fixed",
        textShadow: "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
      }}
    >
      <Stack align="center">
        <div style={{ textAlign: "center" }}>
          <Title color={"white"}>COH3 STATS are coming soon!</Title>
          <Title color={"white"} order={2}>
            after the game release
          </Title>
          <Space h={"xl"} />
          <Title color={"white"} order={4}>
            Please come help us build the site.
            <br />
            More info on GitHub or Discord.
          </Title>
          <Space h={"xl"} />
          <Group position="center" spacing="md">
            <Discord />
            <Github />
          </Group>
        </div>
      </Stack>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}

export default Landing;
