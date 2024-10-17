import Text from "./Text";
import styles from "./Text.module.css";

const LoadFilesText = ({ label }) => (
  <Text variant="loadFilesText" children={<>{label}</>} />
);

export default LoadFilesText;
