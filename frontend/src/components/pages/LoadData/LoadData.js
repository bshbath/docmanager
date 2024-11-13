import React, { useEffect, useState, useRef } from "react";
import Header from "../../molecules/Header/Header";
import LargeFileImage from "../../atoms/Image/LargeFileImage";
import LoadFilesText from "../../atoms/Text/LoadFilesText";
import CopyFilesText from "../../atoms/Text/CopyFilesText";
import LoadProgressText from "../../atoms/Text/LoadProgressText";
import LoadCompleteText from "../../atoms/Text/LoadCompleteText";
import Spinner from "../../atoms/Spinner/Spinner";
import { Loader } from "@mantine/core";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import ProjectsList from "../../molecules/ProjectsList/ProjectsList";

import { useOperations } from "../../../context/OperationsContext";

import Button from "../../atoms/Button/Button";
import styles from "./LoadData.module.css";

const LoadData = () => {
  const {
    loadProgress,
    loadResults,
    loading,
    loadError,
    loadComplete,
    allProjects,
    selectedProject,
    setSelectedProject,
    loadSelectedProject,
    getProjectLoadstatus,
  } = useOperations();

  const navigate = useNavigate();
  const pollTimer = useRef();

  const loadProject = (projectName) => {
    startPolling();
    loadSelectedProject(projectName);
  };

  useEffect(() => {
    console.log("PPPP: ", loadResults);
  }, [loadResults]);

  const goToSearch = () => {
    navigate("/search");
  };

  const onProjectSelect = (selectedProject) => {
    setSelectedProject(selectedProject);
  };

  const startPolling = () => {
    const timer = setInterval(pollLoadStatus, 1000);
    pollTimer.current = timer;
  };

  const stopPolling = () => {
    clearInterval(pollTimer.current);
  };

  const pollLoadStatus = async () => {
    let loadStatus = "";
    if (selectedProject.name) {
      loadStatus = await getProjectLoadstatus(selectedProject.name);
      console.log("SHOULD STOP POLLING ", loadStatus);
    }
    if (
      loadStatus == "Completed" ||
      loadStatus == "Not Found" ||
      loadStatus !== "Processing"
    ) {
      stopPolling();
    }
  };

  useEffect(() => {
    return () => clearInterval(pollTimer.current);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.projectsAndBody}>
        <div className={styles.projects}>
          <ProjectsList
            onProjectSelect={onProjectSelect}
            projects={allProjects || []}
            selectedProject={selectedProject.name}
          />
        </div>
        <div className={styles.body}>
          <div className={styles.fileIcon}>
            <LargeFileImage />
          </div>
          <div className={styles.loadFilesText}>
            <LoadFilesText
              label={loadComplete ? "Loading complete" : "Load files"}
            />
          </div>
          <div className={styles.copyFilesText}>
            {loadResults.count > 0 ? (
              <LoadCompleteText loadedFilesCount={loadProgress} />
            ) : (
              <CopyFilesText />
            )}
          </div>
          <div className={styles.buttons}>
            <div className={styles.spinnerAndLoadButton}>
              {loadComplete && !loading ? (
                <div className={styles.loadMoreButtons}>
                  <div className={styles.loadMoreButton}>
                    <Button
                      onClick={() => loadProject(selectedProject.name)}
                      label="Load more"
                      disabled={!selectedProject.name}
                      variant="primary"
                    />
                  </div>
                  {selectedProject.loaded && (
                    <div className={styles.loadButton}>
                      <Button
                        onClick={() => goToSearch()}
                        label="Next"
                        variant="secondary"
                        chevron="right"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* {true && <Spinner />} */}
                  {loading && (
                    <div className={styles.loadMoreButton}>
                      <RotatingLines
                        visible={loading}
                        height="50"
                        width="50"
                        color="grey"
                        strokeWidth="5"
                        animationDuration="0.75"
                        ariaLabel="rotating-lines-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                    </div>
                  )}

                  <div className={styles.loadButton}>
                    <Button
                      variant="primary"
                      // chevron={"right"}
                      onClick={() => loadProject(selectedProject.name)}
                      label={selectedProject.loaded ? "Reload" : "Load"}
                      disabled={loading || !selectedProject.name}
                    />
                  </div>
                  {selectedProject.loaded && (
                    <div className={styles.loadButton}>
                      <Button
                        onClick={() => goToSearch()}
                        label="Search"
                        variant="secondary"
                        chevron="right"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={styles.loadingProgress}>
              {(loadComplete || loading) && (
                <LoadProgressText loadedFilesCount={loadProgress} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadData;
