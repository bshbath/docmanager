import React, { useState, useEffect } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import Modal from "react-modal";
import "./App.css";
import LoadData from "./components/pages/LoadData/LoadData";
import SearchData from "./components/pages/SearchData/SearchData";
// import PDFModal from "./components/pages/PDFModal/PDFModal";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FileExplorer from "./components/organisms/FileExplorer/FileExplorer";
import Input from "./components/atoms/Input/Input";
import { OperationsProvider } from "./context/OperationsContext";
import { createTheme, MantineProvider } from "@mantine/core";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    height: "80%",
  },
};

const App = () => {
  const [keywords, setKeywords] = useState([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [fileOccurrences, setFileOccurrences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [highlightedPages, setHighlightedPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (event, filePath) => {
    const tooltipX = event.clientX;
    const tooltipY = event.clientY;

    setTooltipPosition({ top: tooltipY + 10, left: tooltipX }); // Adjust top to be slightly below the cursor
  };

  const getInfoTooltip = (filePath) => {
    const parts = filePath.split("/");
    const fileName = parts.pop();
    let description = `Go to the ${parts[0]} folder.`;

    parts.slice(1).forEach((part) => {
      description += ` From there, navigate to the ${part} folder.`;
    });

    description += ` Inside there you will find the ${fileName} file.`;
    return description;
  };

  const preprocessPath = (path) => path;

  function getHighlightedPdfPath(pdfPath) {
    return removePrefix(pdfPath);
  }

  function removePrefix(text) {
    const prefix = "./All Files-processed";
    if (text.startsWith(prefix)) {
      return text.slice(prefix.length);
    }
    return text;
  }

  const handleKeywordChange = async (event) => {
    const keyword = event.target.value;
    setSelectedKeyword(keyword);
    setLoading(true);

    try {
      const baseFolder = `/pdfs/All Files-processed-${keyword}-highlighted`;

      const [occurrencesResponse] = await Promise.all([
        axios.get(`${baseFolder}/${keyword}-occurrences.txt`),
      ]);

      const occurrencesData = occurrencesResponse.data
        .split("\n")
        .filter((line) => line.trim());
      const occurrences = [];
      let currentFile = null;
      let currentPages = [];

      occurrencesData.forEach((line) => {
        if (line.startsWith("File: ")) {
          if (currentFile) {
            occurrences.push({
              file: preprocessPath(currentFile),
              pages: currentPages,
            });
          }
          currentFile = line.replace("File: ", "").trim();
          currentPages = [];
        } else if (line.startsWith("Pages with occurrences: ")) {
          const pages = line
            .replace("Pages with occurrences: [", "")
            .replace("]", "")
            .split(",")
            .map((page) => parseInt(page.trim(), 10));
          currentPages = pages;
        }
      });

      if (currentFile) {
        occurrences.push({
          file: currentFile,
          pages: currentPages,
        });
      }

      setFileOccurrences(occurrences);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (file, pages) => {
    setSelectedFile(file);
    setHighlightedPages(pages);
    setCurrentPageIndex(0);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const goToPreviousPage = () => {
    setCurrentPageIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const goToNextPage = () => {
    setCurrentPageIndex((prevIndex) =>
      Math.min(prevIndex + 1, highlightedPages.length - 1)
    );
  };
  return (
    <Router>
      <MantineProvider>
        <OperationsProvider>
          <Routes>
            <Route path="/" element={<LoadData />} />
            <Route path="/search" element={<SearchData />} />
          </Routes>
        </OperationsProvider>
      </MantineProvider>
    </Router>
  );
  return (
    <div className="App">
      <h1>Keyword Search Results</h1>

      <div className="controls">
        <label htmlFor="keyword-select">Select Keyword:</label>
        <select
          id="keyword-select"
          value={selectedKeyword}
          onChange={handleKeywordChange}
        >
          <option value="">-- Select a Keyword --</option>
          {keywords.map((keyword) => (
            <option key={keyword} value={keyword}>
              {keyword}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && selectedKeyword && (
        <div className="results">
          <h2>
            Files Containing the Keyword: (Total {fileOccurrences.length}):
          </h2>
          <ul>
            {fileOccurrences.map((entry, index) => (
              <li key={index}>
                <div
                  className="tooltip-container"
                  onMouseMove={(e) => handleMouseEnter(e, entry.file)}
                >
                  <button onClick={() => openModal(entry.file, entry.pages)}>
                    {entry.file}
                  </button>
                  <span className="tooltip-text">
                    {getInfoTooltip(entry.file)}
                  </span>
                </div>
                <p>Pages with occurrences: {entry.pages.join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <FileExplorer />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="PDF Viewer"
        ariaHideApp={false}
        appElement={document.getElementById("app")}
      >
        <button onClick={closeModal}>Close</button>
        <div style={{ height: "100%", overflowY: "auto" }}>
          <Document
            file={`/pdfs/All Files-processed-${selectedKeyword}-highlighted/${getHighlightedPdfPath(
              selectedFile
            )}`}
            onLoadSuccess={() => {
              document.querySelector(".react-pdf__Page").scrollIntoView();
            }}
          >
            <Page pageNumber={highlightedPages[currentPageIndex]} />
          </Document>
        </div>
        <div className="navigation">
          <button onClick={goToPreviousPage} disabled={currentPageIndex === 0}>
            Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPageIndex === highlightedPages.length - 1}
          >
            Next
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
