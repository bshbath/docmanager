import React from "react";
import PropTypes from "prop-types";
import "@fontsource/montserrat";
import styles from "./Text.module.css";

const Text = ({
  children,
  variant = "primary",
  bold = false,
  text = "Text",
  ...props
}) => {
  const classNames = `${styles.text} ${styles[variant]} ${
    bold ? styles.bold : ""
  }`;
  return <p className={classNames}>{children}</p>;
};

Text.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "heading",
    "subheading",
    "fileName",
    "searchFilesText",
    "loadedFilesCount",
    "loadFilesText",
    "loadFilesSubText",
  ]),
  bold: PropTypes.bool,
};

export default Text;
