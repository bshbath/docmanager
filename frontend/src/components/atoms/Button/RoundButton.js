import React from "react";
import Button from "./Button";

const RoundButton = ({ onClick, iconImage, iconSize = "half" }) => {
  return (
    <div>
      <Button iconImage={iconImage} iconSize={iconSize} onClick={onClick} />
    </div>
  );
};

export default RoundButton;
