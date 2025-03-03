import React, { useEffect, useRef, useState } from "react";
import Header from "../../molecules/Header/Header";
import MediumFileImage from "../../atoms/Image/MediumFileImage";
import CustomSelect from "../../atoms/Select/Select";
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
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import MarkdownIt from "markdown-it";
import showdown from "showdown";
import {
  faMaximize,
  faMinimize,
  faFilePdf,
  faFileText,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownEditor from "@uiw/react-markdown-editor";

import { useOperations } from "../../../context/OperationsContext";

import Button from "../../atoms/Button/Button";
import styles from "./SearchData.module.css";
import Markdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DocumentPreview = ({ setDocumentContent, documentContent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const downloadMarkdown = () => {
    const blob = new Blob([documentContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to download as PDF
  const downloadPDF = () => {
    // generatePdfFromMarkdown(documentContent);
    const converter = new showdown.Converter();
    const html = converter.makeHtml(documentContent);
    const styledHtml = `
      <div style="width: 600px; margin: auto; font-size: 20px; font-family: Arial, sans-serif;">
        ${html}
      </div>
    `;

    console.log("HHHHHHTTTTMMMLLL ", styledHtml);
    const doc = new jsPDF({
      orientation: "portrait",
      format: "a4",
    });
    doc.html(styledHtml, {
      callback: function (doc) {
        doc.save("document.pdf");
      },
      x: 10,
      y: 10,
    });
  };

  const generatePdfFromMarkdown = async (markdown) => {
    // Initialize MarkdownIt
    const md = new MarkdownIt();

    // Convert Markdown to HTML
    const htmlContent = md.render(markdown);

    // Create a hidden container to render the HTML
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.width = "210mm"; // Set width to A4 dimensions for PDF
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      // Use html2canvas to capture the rendered content
      const canvas = await html2canvas(container, {
        scale: 2, // Increase resolution
        useCORS: true, // Enable CORS for external images
      });

      // Get the image data from the canvas
      const imgData = canvas.toDataURL("image/png");

      // Create a PDF using jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate image width and height to fit in the PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add the image to the PDF, splitting across pages if needed
      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
        if (heightLeft > 0) pdf.addPage();
      }

      // Save the PDF
      pdf.save("document.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Clean up the container
      document.body.removeChild(container);
    }
  };

  return (
    <div
      className={`${styles.screenshotPreview} ${
        isOpen ? styles.screenshotPreviewOpen : styles.screenshotPreviewClosed
      }`}
    >
      <div className={styles.previewButtons}>
        <div onClick={() => setIsOpen(!isOpen)}>
          <FontAwesomeIcon
            className={styles.previewButtonMinMax}
            icon={isOpen ? faMinimize : faMaximize}
          />
        </div>
        {documentContent && (
          <>
            <div onClick={() => downloadPDF()}>
              <FontAwesomeIcon
                className={styles.previewButtonMinMax}
                color="#F40F02"
                icon={faFilePdf}
              />
            </div>
            {/* <div onClick={() => downloadMarkdown()}>
              <FontAwesomeIcon
                color="grey"
                className={styles.previewButtonMinMax}
                icon={faFileText}
              />
            </div> */}
          </>
        )}
      </div>
      {isOpen && (
        <div className={styles.markdownContent}>
          <MarkdownEditor
            value={documentContent}
            height="100vh"
            onChange={(value, viewUpdate) => {
              // console.log("VVVVV: ", value);
              setDocumentContent(value);
            }}
          />
          {/* <Markdown urlTransform={(value) => value}>{documentContent}</Markdown> */}
        </div>
      )}
    </div>
  );
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
  const [documentContent, setDocumentContent] = useState("");
  const [screenshots, setScreenshots] = useState([]);
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
    }
  };

  const projectStages = [
    {
      name: "Offer Processing Phase",
      key: "offer_processing",
    },

    {
      name: "Conclusion of Contract",
      key: "contract_conclusion",
    },
    {
      name: "Construction Implementation",
      key: "construction_implementation",
    },
    {
      name: "Building Acceptance",
      key: "building_acceptance",
    },
    {
      name: "Construction Accounting",
      key: "construction_accounting",
    },
    {
      name: "Guarantee Phase",
      key: "guarantee_phase",
    },
  ];

  const startPolling = () => {
    const timer = setInterval(pollSearchStatus, 1000);
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
    if (loadedPdf && selectFile) {
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
      console.log("PPPPPP ", props);
      fetchPDF({ ...props, searchTerm });
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
      <DocumentPreview
        setDocumentContent={setDocumentContent}
        documentContent={documentContent}
      />
      {selectedFileBlob && (
        <PDFModal
          pages={highlightedPages}
          filePath={selectedFilePath}
          selectedFileBlob={selectedFileBlob}
          selectedFile={selectedFile}
          modalIsOpen={modalIsOpen}
          setModalIsOpen={setModalIsOpen}
          setDocumentContent={setDocumentContent}
          screenshots={screenshots}
          setScreenshots={setScreenshots}
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
              <CustomSelect options={projectStages} />
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
