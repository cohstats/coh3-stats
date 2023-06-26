import { BackgroundImage, Text, Box, Flex } from "@mantine/core";
import { IconCircle } from "@tabler/icons-react";
import { useState } from "react";
import { TwitchStream } from "../../../../src/coh3/coh3-types";
import { isMobileCheck } from "../../../../src/utils";

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
  const isMobile = isMobileCheck();

  return (
    <Flex
      style={{
        justifyContent: "space-around",
      }}
      direction={{ md: "column" }}
      wrap="wrap"
      h="100%"
    >
      {twitchStreams.slice(0, 3).map((stream: TwitchStream, idx: number) => {
        const streamThumbnail = isMobile
          ? stream.thumbnail_url.replace("{width}", "200").replace("{height}", "109")
          : stream.thumbnail_url.replace("{width}", "640").replace("{height}", "380");

        return (
          <Box
            w={{
              base: "50%",
              xs: "33%",
              md: "100%",
              lg: "100%",
            }}
            style={{
              cursor: "pointer",
            }}
            key={stream.id}
            onClick={() => handleChangeChannel(idx)}
            pos="relative"
          >
            <BackgroundImage
              radius="md"
              style={{
                border: `${selected === idx ? "2px solid gold" : "2px solid black"}`,
                color: "white",
                aspectRatio: 16 / 9,
                width: "100%",
              }}
              src={`${streamThumbnail}`}
            >
              <Flex pos="absolute" bottom={5} left={0} w="100%" justify="space-between" px={10}>
                <Flex align="center" gap={4}>
                  <IconCircle fill="red" color="black" size={8} />
                  <Text fw={600}>{stream.user_name}</Text>
                </Flex>
                <Text>{stream.viewer_count}</Text>
              </Flex>
            </BackgroundImage>
          </Box>
        );
      })}
    </Flex>
  );
};
export default ChannelList;
