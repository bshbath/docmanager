import ProjectsList from "../../components/molecules/ProjectsList/ProjectsList";

export default {
  title: "Molecules/ProjectsList",
  component: ProjectsList,
  tags: ["autodocs"],
};

export const SampleProjectsList = {
  args: {
    projects: [
      "Project One",
      "Project Two",
      "Project Three",
      "Project Four",
      "Project Five",
      "Project Six",
      "Project Seven",
      "Project Eight",
      "Project Nine",
    ],
    selectedProject: "Project Two",
  },
};
