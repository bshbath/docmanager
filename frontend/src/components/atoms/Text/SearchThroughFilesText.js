import Text from "./Text";
import styles from "./Text.module.css";

const SearchThroughFilesText = ({ loadedFilesCount = 0 }) => (
  <Text variant="searchFilesText">
    <>
      Search through <span className={`${styles.primary}`}>{"Loaded"}</span>{" "}
      files
    </>
  </Text>
);
export default SearchThroughFilesText;
