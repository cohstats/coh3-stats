import { Anchor, Dialog, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";

const DevSiteNotification = () => {
  const [opened, { open, close }] = useDisclosure(false);
  useEffect(() => {
    if (window.location.hostname !== "coh3stats.com") {
      open();
    }
  }, [open]);

  return (
    <>
      <Dialog
        position={{ bottom: 20, left: 20 }}
        opened={opened}
        withCloseButton
        onClose={close}
        size="lg"
        radius="md"
      >
        <Text size="md">
          You are using the dev version of the site. If you are not here on purpose, please use
          the main version at <Anchor href="https://coh3stats.com">coh3stats.com</Anchor>
        </Text>
      </Dialog>
    </>
  );
};

export default DevSiteNotification;
