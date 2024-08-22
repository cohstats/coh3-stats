import { Tooltip } from "@mantine/core";

interface EllipsisTextProps {
  text: string;
  maxWidth?: string;
  noWrap?: boolean;
}

const EllipsisText = ({ text, maxWidth = "17ch", noWrap = true }: EllipsisTextProps) => {
  const style = {
    float: "left",
    maxWidth: maxWidth,
    overflow: "hidden",
    textOverflow: "ellipsis",
    ...(noWrap && { whiteSpace: "nowrap" }),
    fontSize: "inherit",
  };

  return (
    <>
      <Tooltip label={text}>
        {/*@ts-ignore*/}
        <span style={style}>{text}</span>
      </Tooltip>
    </>
  );
};

export default EllipsisText;
