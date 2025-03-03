import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { Document, Page, pdfjs } from "react-pdf";
import ModalFooter from "../../organisms/ModalFooter/ModalFooter";
import styles from "./PDFModal.module.css";
import CloseButton from "../../atoms/Button/CloseButton";
import Markdown from "react-markdown";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

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
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(16 / 9);

  const canvasRef = useRef(null);
  const pdfPageCanvasRef = useRef(null);

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
    setDocumentContent,
    screenshots,
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
  const getCroppedImage = (canvas, crop) => {
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = crop.width;
    croppedCanvas.height = crop.height;
    const ctx = croppedCanvas.getContext("2d");

    ctx.drawImage(
      canvas,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const base64Image = croppedCanvas.toDataURL("image/png");
    const imageMarkdown = `<img  width="${crop.width / 4}" height="${
      crop.height / 4
    }" src="${base64Image}" alt="Image Description">`;
    // setScreenshots((prevScreenshots) => {
    //   return [...prevScreenshots, imageMarkdown];
    // });
    setDocumentContent((prevContent) => {
      const updatedContent = prevContent + `<div>\n${imageMarkdown}\n</div>`;
      return updatedContent;
    });
    setCrop(null);
  };

  const saveRegion = () => {
    if (pdfPageCanvasRef.current && crop.width && crop.height) {
      getCroppedImage(pdfPageCanvasRef.current, completedCrop);
    }
  };

  console.log("COMPLLLL ett ", completedCrop);
  console.log("COMPLLLL ", crop);

  const dragEnded = (e) => {
    console.log("COMPLLLL drag ended ", e);
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
            <button onClick={() => saveRegion()}>Save Screenshot</button>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.pdfDocument}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              onDragEnd={(e) => dragEnded(e)}
              // aspect={aspect}
              // minWidth={400}
              minHeight={100}
              // circularCrop
            >
              <Document
                file={selectedFileBlob}
                onLoadSuccess={() => {
                  document.querySelector(".react-pdf__Page").scrollIntoView();
                }}
              >
                <Page
                  pageNumber={highlightedPages[currentPageIndex]}
                  canvasRef={(canvas) => {
                    if (canvas) {
                      pdfPageCanvasRef.current = canvas; // Save a reference to the rendered canvas
                    }
                  }}
                />
              </Document>
            </ReactCrop>
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
