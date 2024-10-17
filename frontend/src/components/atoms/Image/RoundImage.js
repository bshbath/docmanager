import React from "react";
import Image from "./Image";

const RoundImage = ({ src, size, alt = "" }) => {
  return (
    <>
      <Image src={src} alt={alt} size={size} rounded={true} />
    </>
  );
};

export default RoundImage;
