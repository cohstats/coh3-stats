import { IconAccessible } from "@tabler/icons";
import { IconButton } from "./IconButton";

export default {
  title: "IconButton",
};

export const Usage = () => (
  <IconButton label="Example">
    <IconAccessible size={20} stroke={1.5} />
  </IconButton>
);
