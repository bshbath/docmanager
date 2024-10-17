import Image from "../../components/atoms/Image/Image";
import Folder from "../../assets/images/Folder.png";
import FileIcon from "../../assets/images/FileIcon.png";
import PaperIcon from "../../assets/images/Paper.png";
import SampleDoc from "../../assets/images/SampleDoc.png";

export default {
  title: "Atoms/Image",
  component: Image,
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
};

export const FolderIcon = {
  args: {
    src: Folder,
    size: "xsmall",
  },
};

export const Paper = {
  args: {
    src: PaperIcon,
    size: "xsmall",
  },
};

export const File = {
  args: {
    src: FileIcon,
    size: "large",
  },
};

export const SampleDocImage = {
  args: {
    src: SampleDoc,
    size: "docCard",
  },
};
