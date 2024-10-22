import React, { useEffect, useRef, useState } from "react";
import Header from "../../molecules/Header/Header";
import MediumFileImage from "../../atoms/Image/MediumFileImage";
import LoadFilesText from "../../atoms/Text/LoadFilesText";
import CopyFilesText from "../../atoms/Text/CopyFilesText";
import LoadProgressText from "../../atoms/Text/LoadProgressText";
import LoadCompleteText from "../../atoms/Text/LoadCompleteText";
import SearchThroughFilesText from "../../atoms/Text/SearchThroughFilesText";
import Spinner from "../../atoms/Spinner/Spinner";
import Input from "../../atoms/Input/Input";
import FileExplorer from "../../organisms/FileExplorer/FileExplorer";
import FileCard from "../../molecules/FileCard/FileCard";
import { Loader } from "@mantine/core";
import { RotatingLines } from "react-loader-spinner";
import PDFModal from "../PDFModal/PDFModal";
import ProjectsList from "../../molecules/ProjectsList/ProjectsList";

import { useOperations } from "../../../context/OperationsContext";

import Button from "../../atoms/Button/Button";
import styles from "./SearchData.module.css";

const data = {
  name: "root",
  toggled: true,
  active: false,
  id: 9,
  children: [
    {
      name: "parent",
      id: 19,
      active: true,
      children: [
        { name: "child1", id: 10 },
        { name: "child2", id: 11 },
      ],
    },
    {
      name: "parent",
      id: 12,
      children: [
        {
          name: "nested parent",
          id: 13,
          children: [
            { name: "nested child 1", id: 14 },
            { name: "nested child 2", id: 15 },
          ],
        },
      ],
    },
    {
      name: "loading",
      id: 199,
    },
  ],
};

const file = {
  id: "someid",
  occurences: 15,
  fileName:
    "File Name File Name File Name File Name File Name File Name FileName",
};

const SearchData = () => {
  const {
    startSearch,
    loadResults,
    loadedPdf,
    fetchPDF,
    searchProgress,
    searchResults,
    rootFolderId,
    socketSearchResults,
    searchOccurences,
    searching,
    searchError,
    loadedFilesCount,
    selectedProjectFolderStructure,
    allProjects,
    selectedProject,
    setSelectedProject,
    selectedProjectFolderFilesStructure: folderFileStructure,
    loadProjectFolderStructure,
    projectStatus,
    getSearchStatus,

    getSearchHistory,
    searchHistoryForProjects,
    resetSearchPage,
  } = useOperations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filesForResults, setFilesForResults] = useState([]);
  const [selectedFileBlob, setSelectedFileBlob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [highlightedPages, setHighlightedPages] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const [showSearchHistory, setShowSearchHistory] = useState(false);

  const pollTimer = useRef();

  const handleSearch = () => {
    if (searchTerm) {
      resetSearchPage();
      setFilesForResults([]);

      startPolling();

      startSearch({
        searchTerm: searchTerm,
        projectName: selectedProject.name,
      });
      // getSearchStatus({
      //   projectName: selectedProject.name,
      //   searchTerm: searchTerm,
      // });
    }
  };

  const startPolling = () => {
    const timer = setInterval(pollSearchStatus, 5000);
    pollTimer.current = timer;
  };

  const stopPolling = () => {
    clearInterval(pollTimer.current);
  };

  const pollSearchStatus = async () => {
    const searchStatus = await getSearchStatus({
      projectName: selectedProject.name,
      searchTerm: searchTerm,
    });
    console.log("SHOULD STOP POLLING ", searchStatus);
    if (searchStatus == "Completed" || searchStatus !== "Searching") {
      console.log("SHOULD STOP POLLING 111 ", searchStatus);
      stopPolling();
    }
  };

  useEffect(() => {
    return () => clearInterval(pollTimer.current);
  }, []);

  const openModal = (file, pages) => {
    setSelectedFileBlob(file);
    setModalIsOpen(true);
  };

  useEffect(() => {
    if (loadedPdf) {
      openModal(loadedPdf, selectFile.pages);
    }
  }, [loadedPdf]);

  const fileExplorerItemSelected = (id) => {
    const filesInFolder = folderFileStructure[id];
    console.log("FILES IN FOLDER ", filesInFolder);
    if (filesInFolder && filesInFolder.length > 0) {
      const filesToDisplay = filesInFolder.map((key) => {
        const file = searchOccurences[key];
        console.log("FILE IN FOLDER ", file);
        if (file && Object.keys(file).length > 0) {
          return {
            fileName: file.fileName,
            occurences: file.pages.length,
            pages: file.pages,
            id: file.id,
            fullPath: file.fullPath,
          };
        } else {
          return {};
        }
      });

      setFilesForResults(filesToDisplay);
    }
  };

  const selectFile = (props) => {
    setSelectedFile(props);
    if (props && props.fullPath) {
      fetchPDF(props.fullPath);
    }
  };

  const searchHistoryItemSelected = (selectedItem) => {
    setSearchTerm(selectedItem);
    setShowSearchHistory(false);
  };

  useEffect(() => {
    if (!modalIsOpen) {
      setSelectedFileBlob(null);
      setSelectedFile(null);
    }
  }, [modalIsOpen]);

  useEffect(() => {
    resetSearchPage();
    setFilesForResults([]);
  }, []);

  useEffect(() => {
    if (selectedProject.loaded) {
      getSearchHistory(selectedProject.name);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject.name) {
      if (searchHistoryForProjects[selectedProject.name]) {
        setSearchHistory(searchHistoryForProjects[selectedProject.name]);
      }
    }
  }, [searchHistoryForProjects]);

  useEffect(() => {
    const fileIds = folderFileStructure[rootFolderId];
    if (!fileIds) {
      return;
    }
    if ((Object.keys(searchOccurences).length === 0) == 0) {
      return;
    }
    const filesToDisplay = fileIds.map((key) => {
      const file = searchOccurences[key];
      if (file) {
        return {
          fileName: file.fileName,
          occurences: file.pages,
          id: file.id,
          fullPath: file.fullPath,
        };
      } else {
        return {};
      }
    });
    console.log("MISSING FILE INFO ", filesToDisplay);
    setFilesForResults(filesToDisplay);
  }, [rootFolderId]);

  useEffect(() => {
    loadProjectFolderStructure();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Header />
      </div>
      {selectedFileBlob && (
        <PDFModal
          pages={highlightedPages}
          filePath={selectedFilePath}
          selectedFileBlob={selectedFileBlob}
          selectedFile={selectedFile}
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
        />
      )}
      <div className={styles.body}>
        <div className={styles.projectListAndSearchInput}>
          <div className={styles.projectSelector}>
            {/* <ProjectsList
              projects={allProjects.filter((proj) => proj.loaded)}
              selectedProject={selectedProject.name}
              onProjectSelect={setSelectedProject}
            /> */}
          </div>
          <div className={styles.searchAndIcon}>
            <div className={styles.fileIcon}>
              <MediumFileImage />
            </div>
            <div className={styles.searchFilesText}>
              <SearchThroughFilesText loadedFilesCount={loadedFilesCount} />
            </div>
            <div className={styles.searchBoxButton}>
              {searching && (
                <RotatingLines
                  visible={true}
                  height="50"
                  width="50"
                  color="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  ariaLabel="rotating-lines-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              )}
              <Input
                variant="searchBox"
                value={searchTerm}
                onChange={setSearchTerm}
                hasDropdown={searchHistory.length > 0}
                dropdownItems={searchHistory}
                dropdownItemSelected={searchHistoryItemSelected}
                dismissDrowdown={() => setShowSearchHistory(false)}
                toggleDropdown={() => setShowSearchHistory(!showSearchHistory)}
                showDropdown={showSearchHistory}
              />
              <Button
                label="Search"
                variant="primary"
                onClick={() => {
                  handleSearch();
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.explorerAndResults}>
          <div className={styles.explorer}>
            <FileExplorer
              data={selectedProjectFolderStructure}
              itemSelected={fileExplorerItemSelected}
            />
          </div>
          <div className={styles.searchResults}>
            <div className={styles.resultsGrid}>
              {filesForResults.map((file) => {
                return <FileCard file={{ ...file }} onClick={selectFile} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchData;
