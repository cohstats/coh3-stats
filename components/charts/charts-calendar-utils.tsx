import { Group, Text } from "@mantine/core";

export const coloursForEachDay = [
  "#f15854",
  "#f4665f",
  "#f8736a",
  "#fa7f76",
  "#fd8c82",
  "#ff988e",
  "#ffa39a",
  "#ffafa6",
  "#ffbbb2",
  "#ffc6bf",
  "#baddba",
  "#add6ac",
  "#9fcf9f",
  "#91c892",
  "#83c185",
  "#74ba78",
  "#65b36b",
  "#55ac5e",
  "#44a551",
  "#2f9e44",
];

export const CalendarTooltipElement = ({
  value,
  day,
  data,
  colorScheme,
}: {
  value: string;
  day: string;
  data: { wins: number; losses: number };
  colorScheme: "light" | "dark";
}) => {
  if (value === undefined || !value) return null;

  const toolTipBackground = colorScheme === "light" ? "#eeeeee" : "#25262B";
  return (
    <div
      style={{
        backgroundColor: toolTipBackground,
        padding: "5px",
        paddingLeft: "10px",
        paddingRight: "10px",
      }}
    >
      <Group spacing={"xs"}>
        {day}: <Text color={"green"}> {data.wins} W</Text> -{" "}
        <Text color={"red"}> {data.losses} L</Text>
      </Group>
    </div>
  );
};
