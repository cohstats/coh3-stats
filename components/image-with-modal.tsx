import { Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";

type Props = {
  width: number;
  height: number;
  modalW: number;
  modalH: number;
  src: string;
  alt: string;
  title: string | undefined;
};
const ImageWithModal = ({ height, width, modalW, modalH, src, alt, title }: Props) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title={title}>
        <Image src={src} width={modalW} height={modalH} alt={alt} loading="lazy" />
      </Modal>
      <Image onClick={open} src={src} width={width} height={height} alt={alt} loading="lazy" />
    </>
  );
};

export default ImageWithModal;
