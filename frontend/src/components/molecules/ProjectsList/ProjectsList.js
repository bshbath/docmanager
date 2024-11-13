import React from "react";
import styles from "./ProjectsList.module.css";
import "@fontsource/montserrat";

const ProjectsList = ({
  onProjectSelect,
  projects = [],
  processedProjects = ["Project A"],
  selectedProject = "",
}) => {
  return (
    <div className={styles.container}>
      {projects.map((project) => {
        return (
          <div key={project.name} className={styles.projectAndCheck}>
            <div className={styles.check}>{project.loaded ? "✔" : ""}</div>
            <div
              className={
                project.name == selectedProject
                  ? styles.selectedProject
                  : styles.project
              }
              onClick={() => {
                onProjectSelect(project);
              }}
            >
              <div styles={{ height: "70px" }}>{project.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsList;
