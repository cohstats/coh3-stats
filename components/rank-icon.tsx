import Image from "next/image";

type Props = {
  width: number;
  height: number;
  src: string;
  alt: string;
};
const RankIcon = ({ height, width, src, alt }: Props) => {
  return (
    <>
      <Image style={{}} src={src} width={width} height={height} alt={alt} loading="lazy" />
    </>
  );
};

export default RankIcon;
