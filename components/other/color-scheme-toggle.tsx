import { useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons-react";
import { IconButton } from "../icon-button/icon-button";

interface ColorSchemeToggleProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ColorSchemeToggle: React.FC<ColorSchemeToggleProps> = ({ onClick }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    toggleColorScheme();
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <IconButton
      label={colorScheme === "dark" ? "Light mode" : "Dark mode"}
      onClick={handleClick}
      style={{
        backgroundColor:
          colorScheme === "dark" ? "var(--mantine-color-dark-6)" : "var(--mantine-color-gray-0)",
        color:
          colorScheme === "dark"
            ? "var(--mantine-color-yellow-4)"
            : "var(--mantine-color-blue-6)",
      }}
      // sx={(theme) => ({
      //   backgroundColor:
      //     theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
      //   color: theme.colorScheme === "dark" ? theme.colors.yellow[4] : theme.colors.blue[6],
      // })}
    >
      {colorScheme === "dark" ? (
        <IconSun size={20} stroke={1.5} />
      ) : (
        <IconMoonStars size={20} stroke={1.5} />
      )}
    </IconButton>
  );
};
