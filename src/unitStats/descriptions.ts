import { resolveLocstring } from "./locstring";

const getCOH3LocaleDescription = (id: string, locale: string) => {
  return resolveLocstring(
    {
      locstring: {
        name: "ui_name",
        value: id,
      },
    },
    locale,
  );
};

const getUnitStatsCOH3Descriptions = (locale: string = "en") => {
  return {
    common: {
      buildings: getCOH3LocaleDescription("11220464", locale),
      units: getCOH3LocaleDescription("11167012", locale),
      challenges: getCOH3LocaleDescription("11232146", locale),
    },
    british: {
      description: getCOH3LocaleDescription("11234531", locale),
    },
    dak: {
      description: getCOH3LocaleDescription("11220490", locale),
    },
    american: {
      description: getCOH3LocaleDescription("11234529", locale),
    },
    german: {
      description: getCOH3LocaleDescription("11234530", locale),
    },
  };
};

export { getUnitStatsCOH3Descriptions };
