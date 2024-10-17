import Text from "../../components/atoms/Text/Text";
import { fn } from "@storybook/test";
import styles from "./styles.module.css";

export default {
  title: "Atoms/Text",
  component: Text,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    backgroundColor: { control: "color" },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
};

export const LoadFilesText = {
  args: {
    variant: "loadFilesText",
    children: <>Load files</>,
  },
};

export const SearchThroughFiles = {
  args: {
    variant: "searchFilesText",
    children: (
      <>
        Search through <span className={`${styles.primary}`}>156</span> files
      </>
    ),
  },
};

export const LoadFilesSubText = {
  args: {
    variant: "loadFilesSubText",
    children: (
      <>
        Copy files into the{" "}
        <strong className={`${styles.primary}`}>"All Files"</strong> folder in
        the project directory
      </>
    ),
  },
};

export const LoadingCompleteText = {
  args: {
    variant: "loadFilesText",
    children: <>Loading complete</>,
  },
};

export const LoadingCompleteSubText = {
  args: {
    variant: "loadFilesSubText",
    children: (
      <>
        <strong className={`${styles.primary}`}>156</strong> files successfully
        loaded.
      </>
    ),
  },
};
