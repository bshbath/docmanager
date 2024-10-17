import Text from "./Text";
import styles from "./Text.module.css";

const LoadCompleteText = ({ loadedFilesCount }) => (
  <Text variant="loadFilesSubText">
    <>
      <strong className={`${styles.primary}`}>{loadedFilesCount}</strong> files
      successfully loaded
    </>
  </Text>
);
export default LoadCompleteText;
