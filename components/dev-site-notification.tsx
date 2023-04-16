import { Anchor, Dialog, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const DevSiteNotification = () => {
  const [opened, { close }] = useDisclosure(true);

  return (
    <>
      <Dialog
        position={{ bottom: 20, left: 20 }}
        opened={opened}
        withCloseButton
        onClose={close}
        size="lg"
        radius="md"
        bg={"orange.3"}
      >
        <Text size="md" color="black">
          You are using the dev version of the site. If you are not here on purpose, please use
          the main version at <Anchor href="https://coh3stats.com">coh3stats.com</Anchor>
        </Text>
      </Dialog>
    </>
  );
};

export default DevSiteNotification;
