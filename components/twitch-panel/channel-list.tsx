import { BackgroundImage, List, Group, Text, Box, Flex } from "@mantine/core";
import { useState } from "react";
import { TwitchStream } from "../../src/coh3/coh3-types";

type Props = {
  twitchStreams: TwitchStream[];
  onChangeChannel: (index: number) => void;
};
const ChannelList = ({ onChangeChannel, twitchStreams }: Props) => {
  const [selected, setSelected] = useState(0);
  function handleChangeChannel(idx: number) {
    onChangeChannel(idx);
    setSelected(idx);
  }
  return (
    <List listStyleType="none" pb="xl">
      <Flex direction="column" gap={10} justify="space-between">
        {twitchStreams.slice(0, 4).map((stream: TwitchStream, idx: number) => {
          return (
            <List.Item
              key={stream.id}
              style={{
                cursor: "pointer",
              }}
              onClick={() => handleChangeChannel(idx)}
            >
              <Box maw={300} mx="auto" pos="relative">
                <BackgroundImage
                  radius="md"
                  maw={200}
                  w={200}
                  h={110}
                  mx="auto"
                  style={{
                    border: `${selected === idx ? "2px solid white" : "none"}`,
                    borderRadius: "12px",
                    color: "white",
                  }}
                  src={`${stream.thumbnail_url
                    .replace("{width}", "1280")
                    .replace("{height}", "720")}`}
                >
                  <Flex
                    pos="absolute"
                    bottom={5}
                    left={0}
                    w="100%"
                    justify="space-between"
                    px={10}
                  >
                    <Text>{stream.user_name}</Text>
                    <Text>{stream.viewer_count}</Text>
                  </Flex>
                </BackgroundImage>
              </Box>
            </List.Item>
          );
        })}
      </Flex>
    </List>
  );
};
export default ChannelList;
