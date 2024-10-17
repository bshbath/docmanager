// src/context/OperationsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
// import {
//   initiateSearch,
//   initiateLoad,
//   fetchSearchResults,
//   fetchLoadResults,
//   fetchPDFFile,
// } from "../api/operations";
import operations from "../api/operations";
import { useSocket } from "./SocketContext";

const {
  initiateSearch,
  initiateLoad,
  fetchSearchResults,
  fetchLoadResults,
  fetchPDFFile,

  loadAllProjects,
  loadProcessedProjects,
  loadSelectedProject,
  loadProjectStatus,

  loadProjectStructure,
} = operations;

const OperationsContext = createContext();

export const useOperations = () => useContext(OperationsContext);

export const OperationsProvider = ({ children }) => {
  const {
    searching,
    searchProgress,
    searchComplete,
    searchResults: socketSearchResults,
    rootFolderId,

    loading,
    loadProgress,
    loadComplete,
    loadedFilesCount,
    // folderFileStructure,
  } = useSocket();

  // Search states
  const [searchResults, setSearchResults] = useState([]);
  // const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [allProjects, setAllProjects] = useState([]);

  // Load states
  const [loadResults, setLoadResults] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadedPdf, setLoadedPdf] = useState(null);
  const [selectedProject, setSelectedProject] = useState({});
  const [processedProjects, setProcessedProjects] = useState([]);
  const [projectStatus, setProjectStatus] = useState({});

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
      // setSearching(true);
      setSearchError("");
      setSearchResults([]); // Clear previous results
      await initiateSearch(searchParams);
    } catch (err) {
      setSearchError("Failed to start search");
      // setSearching(false);
    }
  };

  // Initiate load action
  const startLoad = async () => {
    try {
      // setLoading(true);
      setLoadError("");
      setLoadResults([]); // Clear previous results
      await initiateLoad();
    } catch (err) {
      setLoadError("Failed to start load");
      // setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      let allProjects = await loadAllProjects();
      console.log("ALLL PROJCADFAD ", allProjects);
      setAllProjects(allProjects);
    } catch (error) {
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

  const fetchPDF = async (filePath) => {
    try {
      const pdfFile = await fetchPDFFile(filePath);
      setLoadedPdf(pdfFile);
    } catch (err) {
      console.log("ERror fetching PDF");
    }
  };

  useEffect(() => {
    const getProjectstatus = async (projectName) => {
      try {
        let status = await loadProjectStatus(projectName);
        setProjectsFolderFileStructure((prevProjects) => {
          return {
            ...prevProjects,
            [projectName]: status.folder_file_structure,
          };
        });
        console.log("STATAFADSFASDFADSFasdf  ", status);
        setSelectedProjectFolderFilesStructure(status.folder_file_structure);
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
    getProjectstatus(selectedProject.name);
    if (selectedProject.loaded) {
      const folderStructure = projectsFolderStructure[selectedProject.name];
      if (folderStructure) {
        setSelectedProjectFolderStructure(folderStructure);
      } else {
        loadProjectFolderStructure();
      }
    }
  }, [selectedProject]);

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
        socketSearchResults,
        startSearch,
        searchProgress,
        searching,
        searchError,
        searchComplete,
        rootFolderId,
        loadedPdf,
        fetchPDF,

        loadResults,
        startLoad,
        loadProgress,
        loading,
        loadError,
        loadComplete,
        loadedFilesCount,

        selectedProjectFolderStructure,
        folderFileStructure: selectedProjectFolderFilesStructure,

        allProjects,
        selectedProject,
        setSelectedProject,
        processedProjects,
        loadSelectedProject,

        loadProjectFolderStructure,

        projectStatus,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};
