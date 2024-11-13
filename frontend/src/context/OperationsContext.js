// src/context/OperationsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useInterval } from "./utils";
// import {
//   initiateSearch,
//   initiateLoad,
//   fetchSearchResults,
//   fetchLoadResults,
//   fetchPDFFile,
// } from "../api/operations";
import operations from "../api/operations";

const {
  initiateSearch,
  initiateLoad,
  fetchSearchResults,
  fetchLoadResults,
  fetchPDFFile,

  loadAllProjects,
  loadProcessedProjects,
  setupSelectedProject,
  loadProjectStatus,

  loadProjectStructure,
  loadSearchStatus,
  fetchSearchHistoryForProject,
} = operations;

const OperationsContext = createContext();

export const useOperations = () => useContext(OperationsContext);

export const OperationsProvider = ({ children }) => {
  // Search states
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [allProjects, setAllProjects] = useState([]);

  // Load states
  const [loadResults, setLoadResults] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loadedPdf, setLoadedPdf] = useState(null);
  const [selectedProject, setSelectedProject] = useState({});
  const [processedProjects, setProcessedProjects] = useState([]);
  const [projectStatus, setProjectStatus] = useState({});
  const [projectSearchStatus, setProjectSearchStatus] = useState({});
  const [searchOccurences, setSearchOccurences] = useState({});
  const [loadingCurrentProject, setLoadingCurrentProject] = useState(false);

  const [searchHistoryForProjects, setSearchHistoryForProjects] = useState({});
  const [rootFolderId, setRootFolderId] = useState("");

  // Progress States
  const [searching, setSearching] = useState(false);
  const [loadingAllProjects, setLoadingAllProjects] = useState(false);
  const [searchProgress, setSearchProgress] = useState(null);
  const [searchComplete, setSearchComplete] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadComplete, setLoadComplete] = useState(false);
  const [loadedFilesCount, setLoadedFilesCount] = useState(0);

  const [selectedProjectFolderStructure, setSelectedProjectFolderStructure] =
    useState({});

  const [
    selectedProjectFolderFilesStructure,
    setSelectedProjectFolderFilesStructure,
  ] = useState({});

  const [projectsFolderFileStructure, setProjectsFolderFileStructure] =
    useState({});
  const [projectsFolderStructure, setProjectsFolderStructure] = useState({});

  // Initiate search action
  const startSearch = async (searchParams) => {
    try {
      setSearching(true);
      setSearchError("");
      setSearchResults([]); // Clear previous results
      await initiateSearch(searchParams);
    } catch (err) {
      setSearchError("Failed to start search");
      setSearching(false);
    }
  };

  const loadSelectedProject = async (projectName) => {
    console.log("PPPPP :; adf ", projectName);
    setLoadingCurrentProject(true);
    try {
      await setupSelectedProject(projectName);
    } catch (error) {
      setLoadError("Failed to load project ", projectName, error);
    }
  };

  const loadProjects = async () => {
    try {
      setLoadingAllProjects(true);
      let allProjects = await loadAllProjects();
      setLoadingAllProjects(false);
      console.log("Alll : ", allProjects);
      setAllProjects(allProjects);
    } catch (error) {
      setLoadingAllProjects(false);
      setLoadError("Failed to load all projects");
    }
  };

  const loadProcessedProjects = async () => {
    try {
      let processedProjects = await loadProcessedProjects();
      setProcessedProjects(processedProjects);
    } catch (error) {
      setLoadError("Failed to load all projects");
    }
  };

  const loadProjectFolderStructure = async () => {
    let projectName = selectedProject.name;
    if (!projectName) {
      return;
    }

    if (projectsFolderStructure[projectName]) {
      return;
    }

    try {
      let folderStructure = await loadProjectStructure(projectName);
      setProjectsFolderStructure((previousProjects) => {
        return {
          ...previousProjects,
          [projectName]: folderStructure,
        };
      });
      setSelectedProject(folderStructure);
    } catch (error) {
      setLoadError("Failed to get project folder structure");
    }
  };
  const fetchPDF = async (fileProps) => {
    try {
      const pdfFile = await fetchPDFFile(fileProps);
      setLoadedPdf(pdfFile);
    } catch (err) {
      console.log("ERror fetching PDF");
    }
  };

  useEffect(() => {
    const getProjectstatus = async (projectName) => {
      try {
        let status = await loadProjectStatus(projectName);
        setProjectStatus((prevProjects) => {
          return {
            ...prevProjects,
            [projectName]: status,
          };
        });
      } catch (error) {
        setLoadError("Failed to load all projects");
      }
    };
    if (selectedProject.name) {
      getProjectstatus(selectedProject.name);
    }
  }, [selectedProject]);

  const getProjectLoadstatus = async (projectName) => {
    let status = "";
    try {
      let loadStatus = await loadProjectStatus(projectName);
      status = loadStatus.status;
      if (status == "Completed") {
        let updatedProjects = allProjects.map((project) => {
          if (project.name == projectName) {
            return {
              ...project,
              loaded: true,
            };
          } else {
            return project;
          }
        });
        setAllProjects(updatedProjects);
        setSelectedProject({
          ...selectedProject,
          loaded: true,
        });
      }
      if (status == "Processing") {
        setLoadProgress(loadStatus.file_count);
      }
      if (
        status == "Completed" ||
        status == "Not Found" ||
        status !== "Processing"
      ) {
        setLoadingCurrentProject(false);
      }
    } catch (error) {
      setLoadError("Failed to load all projects");
      setLoadingCurrentProject(false);
    }
    return status;
  };

  const getSearchStatus = async ({ projectName, searchTerm }) => {
    let status = "";
    if (!projectName || !searchTerm) {
      return;
    }

    try {
      let searchStatus = await loadSearchStatus({ projectName, searchTerm });
      status = searchStatus.status;
      if (searchStatus.status == "Completed") {
        setSearching(false);
        let searchFolderStructure = searchStatus.folder_structure;
        let folderFilesStructure = searchStatus.folder_file_structure;
        console.log("STATAFADSFASDFADSFasdf 2222 ", searchStatus);
        setSelectedProjectFolderFilesStructure(folderFilesStructure);
        console.log("STATAFADSFASDFADSFasdf 333 ", searchFolderStructure);
        let occurences = searchStatus.occurences;
        setSelectedProjectFolderStructure(searchFolderStructure);
        setSearchOccurences(occurences);
        setSearching(false);
      } else if (
        searchStatus.status == "Not Found" ||
        searchStatus.status !== "Searching"
      ) {
        setSearching(false);
      }
    } catch (error) {
      setSearching(false);
    }
    return status;
  };

  const resetSearchPage = () => {
    if (selectedProject.name) {
      setSelectedProjectFolderStructure({
        name: selectedProject.name,
        id: selectedProject.name,
        active: false,
        toggled: false,
        children: [],
      });
    } else {
      setSelectedProjectFolderStructure({});
    }
  };

  const getSearchHistory = async (projectName) => {
    if (!projectName) {
      return;
    }
    try {
      let searchHistory = await fetchSearchHistoryForProject({ projectName });
      setSearchHistoryForProjects((previousHistory) => {
        return {
          ...searchHistoryForProjects,
          [projectName]: searchHistory,
        };
      });
    } catch (error) {}
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Fetch search results when complete
  useEffect(() => {
    if (searchComplete) {
      const fetchResults = async () => {
        try {
          const results = await fetchSearchResults();
          setSearchResults(results);
          // setSearching(false);
        } catch (err) {
          setSearchError("Failed to fetch search results");
          // setSearching(false);
        }
      };
      fetchResults();
    }
  }, [searchComplete]);

  // Fetch load results when complete
  useEffect(() => {
    if (loadComplete) {
      const fetchResults = async () => {
        try {
          const results = await fetchLoadResults();
          // setLoadResults(results);
          // setLoading(false);
        } catch (err) {
          setLoadError("Failed to fetch load results");
          // setLoading(false);
        }
      };
      fetchResults();
    }
  }, [loadComplete]);

  return (
    <OperationsContext.Provider
      value={{
        searchResults,
        startSearch,
        searchProgress,
        searching,
        searchError,
        searchComplete,
        rootFolderId,
        loadedPdf,
        fetchPDF,
        getProjectLoadstatus,

        loadResults,
        loadProgress,
        loading: loadingAllProjects || loadingCurrentProject,
        loadError,
        loadComplete,
        loadedFilesCount,

        selectedProjectFolderStructure,
        selectedProjectFolderFilesStructure,

        allProjects,
        selectedProject,
        setSelectedProject,
        processedProjects,
        loadSelectedProject,

        loadProjectFolderStructure,

        projectStatus,
        searchOccurences,
        getSearchStatus,
        searchHistoryForProjects,
        getSearchHistory,

        resetSearchPage,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};
