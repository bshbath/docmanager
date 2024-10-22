import React from "react";
import styles from "./Input.module.css";
import PropTypes from "prop-types";
import "@fontsource/montserrat";
import ChevronRoundButton from "../Button/ChevronRoundBottun";
import { faL } from "@fortawesome/free-solid-svg-icons";

const Input = ({
  type,
  placeholder = "",
  value,
  onChange,
  size = "medium",
  disabled = false,
  variant = "default",
  hasDropdown = true,
  dropdownItems = ["John Doe", "Jane Doe"],
  dropdownItemSelected,
  dismissDrowdown,
  toggleDropdown,
  showDropdown,
}) => {
  return (
    <div className={styles.searchAndHistory}>
      <div>
        <input
          className={`${styles.input} ${styles[size]} ${styles[variant]}`}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          value={value}
          type={type}
          placeholder={placeholder}
        />

        <div
          className={showDropdown ? styles.dropdownShow : styles.dropdownHide}
        >
          {showDropdown &&
            dropdownItems.map((item) => (
              <div
                onClick={() => dropdownItemSelected(item)}
                className={styles.dropdownItem}
              >
                {item}
              </div>
            ))}
        </div>
      </div>
      {hasDropdown && (
        <div className={styles.searchHistoryDropdown}>
          <ChevronRoundButton
            size={"xsmall"}
            chevron="down"
            onClick={() => toggleDropdown()}
          />
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(["searchBox"]),
};

export default Input;
