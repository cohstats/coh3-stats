export const getNivoTooltipTheme = (colorScheme: "dark" | "light") => {
  if (colorScheme === "dark") {
    return {
      tooltip: {
        container: {
          background: "#333",
        },
      },
    };
  } else {
    return {};
  }
};
