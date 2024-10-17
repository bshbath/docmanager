import React from "react";
import Image from "./Image";

const RoundIcon = ({ src, alt = "", ...props }) => {
  return (
    <>
      <Image src={src} alt={alt} {...props} rounded={true} />
    </>
  );
};

export default RoundIcon;
