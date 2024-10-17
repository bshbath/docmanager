import React from "react";
import Button from "./Button";

const ChevronRoundButton = (props) => {
  return (
    <div>
      <Button round={true} {...props} />
    </div>
  );
};

export default ChevronRoundButton;
