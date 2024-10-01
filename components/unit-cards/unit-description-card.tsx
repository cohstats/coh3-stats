import { BackgroundImage, Flex, Text, Title, Tooltip } from "@mantine/core";
import { iconPlaceholder, symbolPlaceholder } from "../placeholders";
import ImageWithFallback from "../placeholders";
import { raceType } from "../../src/coh3/coh3-types";
import { getIconsPathOnCDN } from "../../src/utils";
import { BattlegroupBackgrounds } from "../../src/unitStats";

/**
 * These fields can be found at `sbps` inside each unit object.
 *
 * Most locstrings and symbol / icons are within:
 * - `squadexts` -> `template_reference` which gives the group within the
 *   Essence editor as `sbpextensions\\squad_ui_ext`.
 * - The sibling `race_list` contains a list with an object `race_data/info`. In this
 *   object the locstring values can be found.
 *
 * Specific paths defined per property.
 */
export type UnitDescription = {
  /** Locstring value. Found at `screen_name/locstring/value`. */
  screen_name: string;
  /** Locstring value. Found at `help_text/locstring/value`. */
  help_text: string;
  /** Locstring value. Found at `brief_text/locstring/value`. */
  brief_text: string;
  /** File path. Found at `symbol_icon_name`. */
  symbol_icon_name: string;
  /** File path. Found at `icon_name`. */
  icon_name: string;
};

export const UnitDescriptionCard = ({
  desc,
  faction,
  list,
}: {
  desc: UnitDescription;
  faction: raceType;
  list?: boolean; // Specifies if the description card is used in the list of all units or in unit details
}) => {
  const factionBackgroundSrc = BattlegroupBackgrounds[faction];

  const spaceRegex = /\\r?\\n|\\r|\\n/g;
  const specialRegex = /\*/g;
  const regexDot = /•/g;

  const briefText = desc.brief_text
    ?.replace(spaceRegex, "\n")
    ?.replace(specialRegex, "")
    .replace(regexDot, "• ");

  return (
    <>
      <Flex direction="row" align={list ? "center" : "start"} gap={"md"}>
        <BackgroundImage w={96} h={96} src={getIconsPathOnCDN(factionBackgroundSrc)} radius="md">
          <ImageWithFallback
            width={96}
            height={96}
            src={`/icons/${desc.icon_name}.png`}
            alt={desc.screen_name}
            fallbackSrc={iconPlaceholder}
          />
        </BackgroundImage>
        <Flex direction="column" gap={4}>
          <Title order={6} style={{ textTransform: "capitalize" }} c="yellow.5">
            {desc.help_text}
          </Title>
          <Flex direction="row" align="center" gap={4}>
            <ImageWithFallback
              width={32}
              height={32}
              src={`/icons/${desc.symbol_icon_name}.png`}
              alt={`${desc.screen_name} symbol`}
              fallbackSrc={symbolPlaceholder}
            />
            <Title order={4} style={{ textTransform: "capitalize" }} lineClamp={1}>
              {desc.screen_name}
            </Title>
          </Flex>

          {/* Symbol horizontal aligned with brief text. */}
          <Flex direction="row" align="center" gap={4}>
            <Tooltip.Floating label={briefText} multiline w={500}>
              <Text fz="sm" lineClamp={list ? 2 : 10} style={{ whiteSpace: "pre-line" }}>
                {briefText}
              </Text>
            </Tooltip.Floating>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
