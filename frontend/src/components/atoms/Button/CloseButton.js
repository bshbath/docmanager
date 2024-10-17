import Button from "./Button";
import { faClose } from "@fortawesome/free-solid-svg-icons";

const CloseButton = ({ variant, ...props }) => {
  return <Button close={true} size={"small"} icon={faClose} {...props} />;
};

export default CloseButton;
