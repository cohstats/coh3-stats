import { Button } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import LinkWithOutPrefetch from "./LinkWithOutPrefetch";

interface FinalStandUnitsSwitchProps {
  /** Whether the page currently shown is the Final Stand one. */
  checked: boolean;
  /** Route of the regular units page of the faction. */
  standardHref: string;
  /** Route of the Final Stand units page of the faction. */
  finalStandHref: string;
}

/**
 * Switches between the regular and the Final Stand units list of a faction. The two lists live on
 * separate pages, so - like `MapsViewSwitch` - this is a pair of links styled as a segmented
 * control rather than a real `SegmentedControl`.
 */
export const FinalStandUnitsSwitch = ({
  checked,
  standardHref,
  finalStandHref,
}: FinalStandUnitsSwitchProps) => {
  const { t } = useTranslation("common");

  return (
    <Button.Group>
      <Button
        component={LinkWithOutPrefetch}
        href={standardHref}
        variant={checked ? "default" : "filled"}
        size="sm"
        data-testid="final-stand-view-standard"
      >
        {t("finalStand.multiplayerUnits")}
      </Button>
      <Button
        component={LinkWithOutPrefetch}
        href={finalStandHref}
        variant={checked ? "filled" : "default"}
        size="sm"
        data-testid="final-stand-view-finalstand"
      >
        {t("finalStand.badge")}
      </Button>
    </Button.Group>
  );
};

export default FinalStandUnitsSwitch;
