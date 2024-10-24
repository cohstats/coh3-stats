import { ProcessedMatch } from "../../../../src/coh3/coh3-types";
import {
  Button,
  CloseButton,
  Container,
  CopyButton,
  Drawer,
  Group,
  Space,
  TextInput,
} from "@mantine/core";
import MatchDetail from "../../../matches/match-detail";
import React from "react";
import { getMatchDetailRoute } from "../../../../src/routes";
import { IconCopy } from "@tabler/icons-react";
import { isBrowserEnv } from "../../../../src/utils";
import config from "../../../../config";

const MatchDetailDrawer = ({
  selectedMatchRecord,
  opened,
  onClose,
}: {
  selectedMatchRecord: ProcessedMatch | null;
  opened: boolean;
  onClose: () => void;
}) => {
  const fullDetailRoute = getMatchDetailRoute(
    selectedMatchRecord?.id || "",
    selectedMatchRecord?.matchhistoryreportresults.map((x) => x.profile_id) || [],
  );

  let fullRouteWithBase = "";
  if (isBrowserEnv()) {
    fullRouteWithBase = `${window.location.origin}${fullDetailRoute}`;
  } else {
    fullRouteWithBase = fullDetailRoute;
  }

  return (
    <Drawer opened={opened} onClose={onClose} size="xl" withCloseButton={false} position="bottom">
      <Container size={config.mainContainerSize} pl={0} pr={0}>
        <Group justify="space-between">
          <Group>
            <Button component="a" href={fullDetailRoute} target="_blank">
              Open In New Tab
            </Button>
            <CopyButton value={fullRouteWithBase}>
              {({ copied, copy }) => (
                <>
                  {copied ? (
                    <Button color="green" w={250}>
                      URL Copied to Clipboard
                    </Button>
                  ) : (
                    <TextInput
                      w={250}
                      value={fullRouteWithBase}
                      rightSection={<IconCopy size={16} />}
                      onClick={() => {
                        copy();
                      }}
                    />
                  )}
                </>
              )}
            </CopyButton>
          </Group>
          <CloseButton onClick={onClose} size="lg" />
        </Group>
        <Space h="md" />
        <MatchDetail matchData={selectedMatchRecord} />
      </Container>
    </Drawer>
  );
};

export default MatchDetailDrawer;
