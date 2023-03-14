import { List, Image } from "@mantine/core";
import { useState } from "react";
import { TwitchStream } from "../../src/coh3/coh3-types";

type Props = {
  twitchStreams: TwitchStream[];
  onChangeChannel: (channel: string) => void;
};
const ChannelList = ({ onChangeChannel, twitchStreams }: Props) => {
  const [selected, setSelected] = useState(0);
  function handleChangeChannel(idx: number) {
    onChangeChannel(twitchStreams[idx].user_login);
    setSelected(idx);
  }
  return (
    <List listStyleType="none">
      {twitchStreams.slice(0, 3).map((stream: TwitchStream, idx: number) => {
        return (
          <List.Item
            key={stream.id}
            style={{
              cursor: "pointer",
            }}
            onClick={() => handleChangeChannel(idx)}
          >
            <Image
              radius="md"
              maw={240}
              mx="auto"
              style={{
                border: `${selected === idx ? "4px solid gold" : "none"}`,
                borderRadius: "12px",
              }}
              src={`${stream.thumbnail_url
                .replace("{width}", "1280")
                .replace("{height}", "720")}`}
              alt={`Thumbnail for ${stream.user_login}`}
            />
          </List.Item>
        );
      })}
    </List>
  );
};
export default ChannelList;
