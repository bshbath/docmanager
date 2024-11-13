import React from "react";
import PropTypes from "prop-types";
import styles from "./Image.module.css";

const Image = ({
  src,
  alt = "",
  size = "medium",
  rounded = false,
  lazy = false,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`${styles.image} ${styles[size]} ${
        rounded ? styles.rounded : ""
      }`}
      loading={lazy ? "lazy" : "eager"}
    />
  );
};

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  size: PropTypes.oneOf([
    "small",
    "medium",
    "large",
    "xlarge",
    "docCard",
    "bgImage",
    "logoImage",
  ]), // Different image sizes
  rounded: PropTypes.bool,
  lazy: PropTypes.bool,
};

export default Image;
