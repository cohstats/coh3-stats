import { List, Image } from "@mantine/core";
import { TwitchStream } from "../../src/coh3/coh3-types";

const ChannelList = ({ twitchStreams }: { twitchStreams: TwitchStream[] }) => {
  return (
    <List listStyleType="none">
      {twitchStreams.slice(0, 3).map((stream: TwitchStream) => {
        return (
          <List.Item key={stream.id}>
            <Image
              radius="md"
              maw={240}
              mx="auto"
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
