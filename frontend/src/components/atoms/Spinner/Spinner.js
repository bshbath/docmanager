import React from "react";
import { Loader } from "@mantine/core";

const Spinner = ({ type = "bars", size = 20 }) => {
  return <Loader color="blue" type={type} size={size} />;
};

export default Spinner;
