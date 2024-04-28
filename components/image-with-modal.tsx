import {Modal, Title} from "@mantine/core";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import Image  from 'next/image';

import React from "react";

type Props = {
  width: number;
  height: number;
  modalW?: number;
  modalH?: number;
  src: string;
  alt: string;
  title: string | undefined;
};
const ImageWithModal = ({height, width,  modalW, modalH, src, alt, title}: Props) => {
  const [opened, {open, close}] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 50em)');

  const imageSize = isMobile ? { maxWidth: `${window.innerWidth}px`, maxHeight: `${window.innerHeight}px` } : { maxWidth: "1256px", maxHeight: "800px" };


  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={<Title size={"h3"}>{title}</Title>}
        fullScreen={isMobile}
        centered
        keepMounted={false}
        size={"auto"}
        zIndex={10000}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <img src={src} alt={alt} style={imageSize} />
        </div>
      </Modal>
      <Image
        style={{
          cursor: "pointer",
          objectFit: "contain", // Add this line
          maxHeight: `${width}px`, // Set the maximum height
          maxWidth: `${height}px` // Set the maximum width
      }}
        onClick={open}
        src={src}
        width={width}
        height={height}
        alt={alt}
        loading="lazy"
      />
    </>
  );
};

export default ImageWithModal;
