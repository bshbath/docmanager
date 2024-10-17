import React from "react";
import Image from "./Image";

const Icon = ({ src, alt = "", ...props }) => {
  return (
    <>
      <Image src={src} alt={alt} size="small" {...props} />
    </>
  );
};

export default Icon;
