import Text from "./Text";
import styles from "./Text.module.css";

const LoadProgressText = ({ loadedFilesCount = 0 }) => (
  <Text variant="loadedFilesCount">
    <>
      <strong className={`${styles.primary}`}>{loadedFilesCount}</strong> files
      loaded...
    </>
  </Text>
);
export default LoadProgressText;
