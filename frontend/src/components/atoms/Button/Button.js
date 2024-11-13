import React from "react";
import styles from "./Button.module.css";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faChevronRight,
  faChevronLeft,
  faClose,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

const Button = ({
  label = "",
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  chevron = "none",
  textSize = "defaultTextSize",
  round,
  close,
  icon,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`${styles.buttonContent} ${styles[variant]} ${
        disabled ? styles.disabled : ""
      } ${styles[size]} ${round ? styles.round : ""} ${
        close ? styles.close : ""
      }`}
    >
      {chevron == "down" && (
        <span>
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      )}
      {chevron == "left" && (
        <span>
          <FontAwesomeIcon icon={faChevronLeft} />
        </span>
      )}
      {label && (
        <button
          disabled={disabled}
          className={`${styles.button} ${styles[textSize]} ${
            disabled ? styles.disabled : ""
          }`}
        >
          {label}
        </button>
      )}
      {icon && (
        <span>
          <FontAwesomeIcon icon={icon} />
        </span>
      )}
      {chevron == "right" && (
        <span>
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
      )}
    </div>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "success"]),
  color: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large", "xsmall"]),
  round: PropTypes.bool,
  close: PropTypes.bool,
  disabled: PropTypes.bool,
  chevron: PropTypes.oneOf(["left", "right", "down", "none"]),
};

export default Button;
