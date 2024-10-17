import Text from "./Text";
import styles from "./Text.module.css";

const CopyFilesText = () => {
  return (
    <Text variant="loadFilesSubText">
      <>
        Copy the <strong className={`${styles.primary}`}>"PROCESSOR"</strong>{" "}
        into the folder containing all your projects
      </>
    </Text>
  );
};

export default CopyFilesText;
