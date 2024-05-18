import { Flex, Text, Title, Tooltip } from "@mantine/core";
import { iconPlaceholder, symbolPlaceholder } from "../placeholders";
import ImageWithFallback from "../placeholders";

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

export const UnitDescriptionCard = ({ desc }: { desc: UnitDescription }) => {
  return (
    <>
      <Flex direction="row" align="center" gap={16}>
        <ImageWithFallback
          width={96}
          height={96}
          src={`/icons/${desc.icon_name}.png`}
          alt={desc.screen_name}
          fallbackSrc={iconPlaceholder}
        />
        <Flex direction="column" gap={4}>
          <Title order={6} transform="capitalize" color="yellow.5">
            {desc.help_text}
          </Title>
          <Title order={4} transform="capitalize" lineClamp={1}>
            {desc.screen_name}
          </Title>
          {/* Symbol horizontal aligned with brief text. */}
          <Flex direction="row" align="center" gap={4}>
            <ImageWithFallback
              width={32}
              height={32}
              src={`/icons/${desc.symbol_icon_name}.png`}
              alt={`${desc.screen_name} symbol`}
              fallbackSrc={symbolPlaceholder}
            />

            <Tooltip.Floating label={desc.brief_text} multiline>
              <Text fz="sm" lineClamp={2}>
                {desc.brief_text}
              </Text>
            </Tooltip.Floating>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
