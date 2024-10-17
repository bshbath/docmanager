import { fn } from "@storybook/test";

// import { Button } from './Button';
import Button from "../../components/atoms/Button/Button";
import { faClose } from "@fortawesome/free-solid-svg-icons";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: "Atoms/Button",
  component: Button,
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
  args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    variant: "primary",
    label: "Load",
  },
};

export const Secondary = {
  args: {
    label: "Button",
    variant: "secondary",
  },
};

export const Large = {
  args: {
    size: "large",
    label: "Button",
  },
};

export const Small = {
  args: {
    size: "small",
    label: "Button",
  },
};

export const RoundDownChevron = {
  args: {
    size: "small",
    chevron: "down",
    round: true,
  },
};

export const RoundRightChevron = {
  args: {
    size: "small",
    chevron: "right",
    round: true,
  },
};

export const CloseIconButton = {
  args: {
    close: true,
    size: "small",
    icon: faClose,
  },
};
