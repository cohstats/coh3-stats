import { Tooltip } from "@mantine/core";

interface EllipsisTextProps {
  text: string;
  maxWidth?: string;
}

const EllipsisText = ({ text, maxWidth }: EllipsisTextProps) => {
  maxWidth = maxWidth || "17ch";

  const style = {
    float: "left",
    maxWidth: maxWidth,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
