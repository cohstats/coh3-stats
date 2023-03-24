import { maps } from "../../src/coh3/coh3-data";
import { Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import React from "react";

const RenderMap = ({ mapName }: { mapName: string }) => {
  const [opened, { open, close }] = useDisclosure(false);
  // In case we don't track the map, eg custom maps
  if (!maps[mapName]) {
    return (
      <div>
        <Text align="center" style={{ whiteSpace: "nowrap" }}>
          {mapName}
        </Text>
      </div>
    );
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title={maps[mapName].name}>
        <Image src={maps[mapName]?.url} width={400} height={400} alt={mapName} loading="lazy" />
      </Modal>
      <div onClick={open} style={{ cursor: "pointer" }}>
        <Image src={maps[mapName]?.url} width={60} height={60} alt={mapName} loading="lazy" />
        <Text align="center" style={{ whiteSpace: "nowrap" }}>
          {maps[mapName]?.name}
        </Text>
      </div>
    </>
  );
};

export default RenderMap;
