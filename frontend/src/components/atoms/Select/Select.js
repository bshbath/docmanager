import React from "react";
import style from "./Select.module.css"; // Import custom styles

const CustomSelect = ({ options = [] }) => {
  return (
    <div className={style.select_container}>
      <select className={style.custom_select}>
        <option disabled value="">
          Select project phase
        </option>
        {options.map((option) => {
          return <option value={option.key}>{option.name}</option>;
        })}
        <option value="all">All phases</option>
      </select>
    </div>
  );
};

export default CustomSelect;
