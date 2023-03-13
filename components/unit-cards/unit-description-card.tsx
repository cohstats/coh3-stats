import slash from "slash";
import { Flex, Image, Text, Title, Tooltip } from "@mantine/core";

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
  id?: string;
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

export const UnitDescriptionCard = (desc: UnitDescription) => (
  <>
    <Flex direction="row" align="center" gap={16}>
      <Image
        width={96}
        height={96}
        fit="contain"
        src={`/icons/${slash(desc.icon_name)}.png`}
        alt={desc.screen_name}
      />
      <Flex direction="column" gap={4}>
        <Title order={6} transform="capitalize" color="yellow.5">
          {desc.help_text}
        </Title>
        <Tooltip label={desc.screen_name}>
          <Title order={4} transform="capitalize" lineClamp={1}>
            {desc.screen_name}
          </Title>
        </Tooltip>
        {/* Symbol horizontal aligned with brief text. */}
        <Flex direction="row" align="center" gap={4}>
          <Image
            width={32}
            height={32}
            fit="contain"
            src={`/icons/${slash(desc.symbol_icon_name)}.png`}
            alt={`${desc.screen_name} symbol`}
          />
          <Tooltip label={desc.brief_text}>
            <Text fz="xs" lineClamp={2}>
              {desc.brief_text}
            </Text>
          </Tooltip>
        </Flex>
      </Flex>
    </Flex>
  </>
);
