import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Document, Page, pdfjs } from "react-pdf";
import ModalFooter from "../../organisms/ModalFooter/ModalFooter";
import styles from "./PDFModal.module.css";
import CloseButton from "../../atoms/Button/CloseButton";

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
    height: "90%",
  },
};

const PDFModal = (props) => {
  //   const [modalIsOpen, setModalIsOpen] = useState(false);
  //   const [selectedFile, setSelectedFile] = useState("");
  //   const [highlightedPages, setHighlightedPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedKeyword, setSelectedKeyword] = useState("");

  //   pages={highlightedPages}
  //   filePath = { selectedFilePath };
  //   selectedFileBlob={selectedFileBlob}
  //   selectedFile={selectedFile}
  //   modalIsOpen={modalIsOpen}

  const {
    filePath,
    selectedFileBlob,
    modalIsOpen,
    selectedFile,
    setModalIsOpen,
  } = props;
  const highlightedPages = selectedFile.pages;

  //   const openModal = (file, pages) => {
  //     setSelectedFile(file);
  //     setHighlightedPages(pages);
  //     setCurrentPageIndex(0);
  //     setModalIsOpen(true);
  //   };

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
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="PDF Viewer"
      ariaHideApp={false}
      appElement={document.getElementById("app")}
    >
      <div className={styles.container}>
        <div className={styles.topNav}>
          <div className={styles.closebutton}>
            <CloseButton onClick={closeModal} />
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.pdfDocument}>
            <Document
              file={selectedFileBlob}
              onLoadSuccess={() => {
                document.querySelector(".react-pdf__Page").scrollIntoView();
              }}
            >
              <Page pageNumber={highlightedPages[currentPageIndex]} />
            </Document>
          </div>
          <div className={styles.navigation}>
            {/* <button onClick={goToPreviousPage} disabled={currentPageIndex === 0}>
          Previous
        </button>
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex === highlightedPages.length - 1}
        >
          Next
        </button> */}
            <ModalFooter
              selectedPageIndex={currentPageIndex}
              pages={highlightedPages}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              onSelectPage={(pageNumberIndex) => {
                setCurrentPageIndex(pageNumberIndex);
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PDFModal;
