import React from "react";
import { Button, Tooltip } from "@mantine/core";
import { IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { TFunction } from "next-i18next/pages";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import { getExplorerMapsRoute, getExplorerMapsTableRoute } from "../../../src/routes";

/**
 * Switch between the two views of the maps list - the cards (`/explorer/maps`) and the table
 * (`/explorer/maps-table`).
 *
 * These are two separate statically generated pages (the table needs a lot more data per map), so
 * this is a pair of links styled as a segmented control rather than a real `SegmentedControl`.
 *
 * The translations live in the `explorer-maps` namespace, which both pages load.
 */
const MapsViewSwitch = ({ active, t }: { active: "cards" | "table"; t: TFunction }) => (
  <Button.Group>
    <Tooltip label={t("explorer-maps:view.cardsTooltip")}>
      <Button
        component={LinkWithOutPrefetch}
        href={getExplorerMapsRoute()}
        variant={active === "cards" ? "filled" : "default"}
        size="xs"
        leftSection={<IconLayoutGrid size={16} />}
        data-testid="maps-view-cards"
      >
        {t("explorer-maps:view.cards")}
      </Button>
    </Tooltip>
    <Tooltip label={t("explorer-maps:view.tableTooltip")}>
      <Button
        component={LinkWithOutPrefetch}
        href={getExplorerMapsTableRoute()}
        variant={active === "table" ? "filled" : "default"}
        size="xs"
        leftSection={<IconTable size={16} />}
        data-testid="maps-view-table"
      >
        {t("explorer-maps:view.table")}
      </Button>
    </Tooltip>
  </Button.Group>
);

export default MapsViewSwitch;
